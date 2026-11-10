-- ==============================================================================
-- SUPABASE E-COMMERCE DATABASE SCHEMA & MIGRATIONS
-- Follows DESIGN.md specifications & production-grade RLS / RPC requirements
-- ==============================================================================

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE PROFILES TABLE (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  shipping_address JSONB DEFAULT '{}'::jsonb,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. CREATE PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  category TEXT NOT NULL,
  attributes JSONB DEFAULT '{}'::jsonb,
  featured BOOLEAN DEFAULT false,
  badge_color TEXT DEFAULT 'lime', -- 'lime', 'lilac', 'coral', 'mint', 'cream'
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. CREATE CART_ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- 5. CREATE ORDERS & ORDER_ITEMS TABLES
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Products RLS: Publicly readable by all users (authenticated and anonymous)
CREATE POLICY "Products are viewable by everyone"
  ON public.products
  FOR SELECT
  USING (true);

-- Products RLS: Only service role / admin can insert, update, delete
CREATE POLICY "Admins can manage products"
  ON public.products
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Profiles RLS: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Profiles RLS: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Profiles RLS: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Cart items RLS: Users can manage exclusively their own cart
CREATE POLICY "Users can view own cart items"
  ON public.cart_items
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON public.cart_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON public.cart_items
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON public.cart_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- Orders RLS: Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Order items RLS: Users can view items belonging to their orders
CREATE POLICY "Users can view own order items"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'New Member'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger firing on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ATOMIC TRANSACTION RPC: create_order_atomic
-- Validates stock, decrements stock, records order & items, and empties cart
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.create_order_atomic(
  p_user_id UUID,
  p_items JSONB, -- Array of { product_id: UUID, quantity: INT }
  p_shipping_address JSONB,
  p_payment_intent_id TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_item RECORD;
  v_product RECORD;
  v_total_amount NUMERIC(10, 2) := 0;
  v_order_id UUID;
  v_line_total NUMERIC(10, 2);
BEGIN
  -- 1. Create the base order record first with 0 total (to be calculated)
  INSERT INTO public.orders (
    user_id,
    total_amount,
    status,
    shipping_address,
    payment_intent_id
  ) VALUES (
    p_user_id,
    0,
    'processing',
    p_shipping_address,
    p_payment_intent_id
  ) RETURNING id INTO v_order_id;

  -- 2. Iterate each item, check stock, decrement, and insert order_item
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INT)
  LOOP
    -- Lock product row FOR UPDATE to avoid race conditions
    SELECT * INTO v_product
    FROM public.products
    WHERE id = v_item.product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product with ID % not found', v_item.product_id;
    END IF;

    IF v_product.stock < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product "%". Requested: %, Available: %',
        v_product.title, v_item.quantity, v_product.stock;
    END IF;

    -- Calculate line amount
    v_line_total := v_product.price * v_item.quantity;
    v_total_amount := v_total_amount + v_line_total;

    -- Decrement product stock
    UPDATE public.products
    SET stock = stock - v_item.quantity,
        updated_at = NOW()
    WHERE id = v_item.product_id;

    -- Insert order item
    INSERT INTO public.order_items (
      order_id,
      product_id,
      quantity,
      unit_price
    ) VALUES (
      v_order_id,
      v_item.product_id,
      v_item.quantity,
      v_product.price
    );
  END LOOP;

  -- 3. Update the order with total amount
  UPDATE public.orders
  SET total_amount = v_total_amount,
      updated_at = NOW()
  WHERE id = v_order_id;

  -- 4. Clear user's cart
  DELETE FROM public.cart_items
  WHERE user_id = p_user_id;

  -- Return created order info
  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'total_amount', v_total_amount,
    'status', 'processing'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- SEED DATA (Curated modern design objects matching DESIGN.md color blocks)
-- ==============================================================================

INSERT INTO public.products (title, description, price, stock, image_urls, category, attributes, featured, badge_color)
VALUES
  (
    'Modular Desk Pad & Cable Rail',
    'Full-grain top surface paired with recycled felt foundation. Includes magnetic snap-in brass cable guides designed for minimal desk setups.',
    78.00,
    14,
    ARRAY['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=80'],
    'Workspace',
    '{"dimensions": "900 x 400 mm", "material": "Vegan Leather / Felt", "weight": "680g"}'::jsonb,
    true,
    'lime'
  ),
  (
    'Monolith Mechanical Keyboard',
    'Solid anodized aluminum chassis with custom lubricated tactile switches and dye-sub PBT keycaps. Crisp acoustic resonance with minimal footprint.',
    220.00,
    8,
    ARRAY['https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80'],
    'Hardware',
    '{"layout": "75% ANSI", "switches": "Tactile Studio 62g", "connectivity": "USB-C / 2.4GHz"}'::jsonb,
    true,
    'lilac'
  ),
  (
    'Acoustic Felt Story Pinboard',
    'Porous geometric sound-dampening acoustic wall panel with flush edge brackets. Holds swatches, sketches, and sticky notes seamlessly.',
    95.00,
    20,
    ARRAY['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80'],
    'Workspace',
    '{"dimensions": "600 x 900 mm", "nrc_rating": "0.85", "color": "Pebble Cream"}'::jsonb,
    false,
    'cream'
  ),
  (
    'Editorial Grid Notebooks (Set of 3)',
    '120gsm fountain-pen friendly Japanese cream paper with 4mm micro-dot grid and lay-flat exposed Swiss binding in pastel palette covers.',
    32.00,
    45,
    ARRAY['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80'],
    'Paper & Print',
    '{"pages": "160 per book", "binding": "Layflat Swiss", "paper": "120gsm Cream"}'::jsonb,
    true,
    'mint'
  ),
  (
    'Cast Aluminum Angle Lamp',
    'Counterweighted swivel desk task light with diffused high-CRI (98+) warm LED puck and step-less tactile brass dial.',
    185.00,
    6,
    ARRAY['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80'],
    'Lighting',
    '{"cri": "98.5", "temperature": "2700K - 4000K", "power": "12W"}'::jsonb,
    true,
    'coral'
  ),
  (
    'Precision Drafting Pen 0.5',
    'Single-block machined aerospace grade titanium pen body with ceramic rollerball mechanism. Perfectly balanced at center of gravity.',
    64.00,
    30,
    ARRAY['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=900&q=80'],
    'Paper & Print',
    '{"refill": "Schmidt P8126", "finish": "Matte Bead-Blasted", "length": "136 mm"}'::jsonb,
    false,
    'pink'
  ),
  (
    'Canvas Portfolio Carrier 16"',
    'Weatherproof heavyweight 18oz duck cotton canvas with padded interior dividers for laptop, sketch tablet, and documents.',
    140.00,
    11,
    ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80'],
    'Bags & Carry',
    '{"capacity": "16L", "hardware": "Solid Gunmetal Brass", "water_resistance": "DWR Waxed"}'::jsonb,
    false,
    'navy'
  ),
  (
    'Ergonomic Cast Armrest Rest Pillow',
    'Molded high-density memory foam topped with breathable knitted merino wool slipcover. Relieves wrist fatigue during long design sessions.',
    42.00,
    25,
    ARRAY['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80'],
    'Workspace',
    '{"cover": "100% Merino Wool", "dimensions": "360 x 80 x 20 mm", "washable": "Yes"}'::jsonb,
    false,
    'cream'
  )
ON CONFLICT DO NOTHING;
