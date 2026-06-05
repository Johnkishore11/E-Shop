-- Seed Categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Devices, gadgets, and tech accessories'),
('Clothing', 'Apparel and daily wear garments'),
('Books', 'Educational books and reading novels'),
('Home & Kitchen', 'Appliances and cooking tools for home'),
('Sports & Fitness', 'Equipment and gear for exercise and games'),
('Footwear', 'Shoes, sneakers, and casual footwear')
ON CONFLICT (name) DO NOTHING;

-- Seed Products in Indian Rupees (INR)

-- 1. Electronics Products
INSERT INTO products (name, description, price, image_url, category_id, stock) VALUES
('Bluetooth Headphones', 'Wireless over-ear headphones with deep bass and long battery life.', 1999.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', (SELECT id FROM categories WHERE name = 'Electronics'), 50),
('Smart Watch', 'Fitness tracker with heart rate monitor, sleep tracking, and notifications.', 2499.00, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', (SELECT id FROM categories WHERE name = 'Electronics'), 30),
('Mechanical Keyboard', 'Wired mechanical keyboard with RGB backlit keys.', 1599.00, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80', (SELECT id FROM categories WHERE name = 'Electronics'), 25),
('Wireless Mouse', 'Optical wireless mouse with USB receiver.', 499.00, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80', (SELECT id FROM categories WHERE name = 'Electronics'), 40);

-- 2. Clothing Products
INSERT INTO products (name, description, price, image_url, category_id, stock) VALUES
('Denim Jacket', 'Classic blue denim jacket for men.', 1499.00, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&q=80', (SELECT id FROM categories WHERE name = 'Clothing'), 40),
('Cotton T-Shirt', 'Plain grey cotton t-shirt for daily wear.', 399.00, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80', (SELECT id FROM categories WHERE name = 'Clothing'), 100),
('Black Hoodie', 'Warm cotton black hoodie with front pocket.', 999.00, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80', (SELECT id FROM categories WHERE name = 'Clothing'), 35);

-- 3. Books Products
INSERT INTO products (name, description, price, image_url, category_id, stock) VALUES
('Clean Code Book', 'A comprehensive handbook of software craftsmanship and design rules.', 599.00, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&q=80', (SELECT id FROM categories WHERE name = 'Books'), 15),
('Sci-Fi Novel', 'An exciting space exploration and adventure story novel.', 299.00, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80', (SELECT id FROM categories WHERE name = 'Books'), 40),
('Biography of Legends', 'Stories of historical figures and their achievements.', 399.00, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&q=80', (SELECT id FROM categories WHERE name = 'Books'), 20);

-- 4. Home & Kitchen Products
INSERT INTO products (name, description, price, image_url, category_id, stock) VALUES
('Mixer Grinder', '500W mixer grinder with 3 stainless steel jars.', 2199.00, 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=500&q=80', (SELECT id FROM categories WHERE name = 'Home & Kitchen'), 20),
('Coffee Maker', 'Drip coffee machine for brewing fresh cups at home.', 1899.00, 'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=500&q=80', (SELECT id FROM categories WHERE name = 'Home & Kitchen'), 12),
('Non-Stick Frying Pan', 'Durable non-stick frying pan for daily cooking.', 699.00, 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&q=80', (SELECT id FROM categories WHERE name = 'Home & Kitchen'), 30);

-- 5. Sports & Fitness Products
INSERT INTO products (name, description, price, image_url, category_id, stock) VALUES
('Yoga Mat', 'Anti-slip exercise yoga mat with carrying strap.', 499.00, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&q=80', (SELECT id FROM categories WHERE name = 'Sports & Fitness'), 30),
('Dumbbell Set', 'PVC adjustable dumbbell set for home workout.', 899.00, 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&q=80', (SELECT id FROM categories WHERE name = 'Sports & Fitness'), 25),
('Badminton Racket', 'Lightweight badminton racket with cover bag.', 1199.00, 'https://images.unsplash.com/photo-1613918431208-6752fe243431?w=500&q=80', (SELECT id FROM categories WHERE name = 'Sports & Fitness'), 15);

-- 6. Footwear Products
INSERT INTO products (name, description, price, image_url, category_id, stock) VALUES
('Running Shoes', 'Comfortable sports shoes for jogging and walking.', 1799.00, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80', (SELECT id FROM categories WHERE name = 'Footwear'), 35),
('Casual Loafers', 'Slip-on casual loafers made of lightweight fabric.', 999.00, 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=500&q=80', (SELECT id FROM categories WHERE name = 'Footwear'), 20),
('Sports Sandals', 'Waterproof outdoor sandals with adjustable straps.', 799.00, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&q=80', (SELECT id FROM categories WHERE name = 'Footwear'), 25);
