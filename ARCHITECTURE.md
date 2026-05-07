# React Shopping Cart - Architecture Documentation

## 📐 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER (Client)                                │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         index.html (Entry)                           │   │
│  └────────────────────────────┬────────────────────────────────────────┘   │
│                                │                                             │
│  ┌─────────────────────────────▼────────────────────────────────────────┐   │
│  │                          main.jsx                                     │   │
│  │  • ReactDOM.createRoot()                                              │   │
│  │  • Wraps App with BrowserRouter                                       │   │
│  └────────────────────────────┬────────────────────────────────────────┘   │
│                                │                                             │
│  ┌─────────────────────────────▼────────────────────────────────────────┐   │
│  │                      Provider.jsx (Global State)                      │   │
│  │  ┌──────────────────────────────────────────────────────────────┐    │   │
│  │  │  AuthProvider (Context + useReducer)                          │    │   │
│  │  │  • user, email, addresses, isAdmin, isVerified                │    │   │
│  │  │  • Checks localStorage for session on mount                   │    │   │
│  │  │  • Creates anonymous user if no session                       │    │   │
│  │  │  ┌────────────────────────────────────────────────────────┐  │    │   │
│  │  │  │  CartProvider (Context + useReducer)                   │  │    │   │
│  │  │  │  • items[], cartIsReady, cartNeedsCheck                │  │    │   │
│  │  │  │  • Merges anonymous + user cart on login               │  │    │   │
│  │  │  │  • Persists to localStorage on every change            │  │    │   │
│  │  │  │  ┌──────────────────────────────────────────────────┐  │  │    │   │
│  │  │  │  │           App.jsx (Router)                       │  │  │    │   │
│  │  │  │  └──────────────────────────────────────────────────┘  │  │    │   │
│  │  │  └────────────────────────────────────────────────────────┘  │    │   │
│  │  └──────────────────────────────────────────────────────────────┘    │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Application Layer Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION LAYER                               │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                         Components (UI)                                 │  │
│  │  • Pages: HomePage, ProductPage, CartPage, CheckoutPage, etc.          │  │
│  │  • Common: Button, Modal, ProductCard, CartItem, Loader, etc.          │  │
│  │  • Layouts: Layout (Header, Footer, Cart Drawer)                       │  │
│  └────────────────────────────┬───────────────────────────────────────────┘  │
└────────────────────────────────┼──────────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼──────────────────────────────────────────────┐
│                            BUSINESS LOGIC LAYER                               │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                      Custom Hooks (Service Layer)                       │  │
│  │                                                                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │  │
│  │  │   useAuth    │  │   useCart    │  │  useProduct  │                 │  │
│  │  │ • signup     │  │ • addItem    │  │ • selectVar  │                 │  │
│  │  │ • login      │  │ • removeItem │  │ • selectSize │                 │  │
│  │  │ • logout     │  │ • deleteItem │  └──────────────┘                 │  │
│  │  └──────────────┘  └──────────────┘                                    │  │
│  │                                                                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │  │
│  │  │ useCheckout  │  │  useOrder    │  │ useInventory │                 │  │
│  │  │ • submitInfo │  │ • createOrder│  │ • checkStock │                 │  │
│  │  │ • selectShip │  │ • getOrders  │  └──────────────┘                 │  │
│  │  └──────────────┘  └──────────────┘                                    │  │
│  │                                                                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │  │
│  │  │ useAddress   │  │  useAdmin    │  │ useProfile   │                 │  │
│  │  │ • create     │  │ • CRUD prods │  │ • editProfile│                 │  │
│  │  │ • edit       │  │ • variants   │  └──────────────┘                 │  │
│  │  │ • delete     │  └──────────────┘                                    │  │
│  │  └──────────────┘                                                       │  │
│  └────────────────────────────┬───────────────────────────────────────────┘  │
└────────────────────────────────┼──────────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼──────────────────────────────────────────────┐
│                              STATE LAYER                                      │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                    Context API + useReducer                             │  │
│  │                                                                          │  │
│  │  ┌─────────────────────┐        ┌─────────────────────┐                │  │
│  │  │   AuthContext       │        │   CartContext       │                │  │
│  │  │ • user              │        │ • items[]           │                │  │
│  │  │ • email             │        │ • cartIsReady       │                │  │
│  │  │ • addresses[]       │        │ • cartNeedsCheck    │                │  │
│  │  │ • isAdmin           │        │                     │                │  │
│  │  │ • isVerified        │        │ Actions:            │                │  │
│  │  │                     │        │ • UPDATE_CART       │                │  │
│  │  │ Actions:            │        │ • DELETE_CART       │                │  │
│  │  │ • LOGIN             │        │ • CART_IS_READY     │                │  │
│  │  │ • LOGOUT            │        └─────────────────────┘                │  │
│  │  │ • UPDATE_USER       │                                                │  │
│  │  │ • UPDATE_ADDRESSES  │                                                │  │
│  │  └─────────────────────┘                                                │  │
│  │                                                                          │  │
│  │  ┌─────────────────────┐        ┌─────────────────────┐                │  │
│  │  │  ProductContext     │        │ CheckoutContext     │                │  │
│  │  │ (Scoped to Product  │        │ (Scoped to Checkout │                │  │
│  │  │  Detail Page)       │        │  Page)              │                │  │
│  │  │                     │        │                     │                │  │
│  │  │ • selectedProduct   │        │ • currentStep       │                │  │
│  │  │ • selectedVariant   │        │ • email             │                │  │
│  │  │ • selectedSkuId     │        │ • shippingAddress   │                │  │
│  │  │ • selectedSize      │        │ • shippingOption    │                │  │
│  │  └─────────────────────┘        │ • shippingCost      │                │  │
│  │                                  └─────────────────────┘                │  │
│  └────────────────────────────┬───────────────────────────────────────────┘  │
└────────────────────────────────┼──────────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼──────────────────────────────────────────────┐
│                              DATA LAYER                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                    db/config.jsx (Database Abstraction)                 │  │
│  │  • getItem(key) → reads from localStorage                               │  │
│  │  • setItem(key, value) → writes to localStorage                         │  │
│  └────────────────────────────┬───────────────────────────────────────────┘  │
│                                │                                              │
│  ┌────────────────────────────▼───────────────────────────────────────────┐  │
│  │                      localStorage (Browser Storage)                     │  │
│  │                                                                          │  │
│  │  Keys:                                                                   │  │
│  │  • local_users              → All registered users                      │  │
│  │  • local_session            → Current logged-in user                    │  │
│  │  • local_session_anon       → Anonymous user UUID                       │  │
│  │  • local_carts_{uid}        → User's cart items                         │  │
│  │  • local_carts_checkout_{uid} → Checkout session                        │  │
│  │  • local_orders             → All orders                                │  │
│  │  • local_admin_products     → Admin-created products                    │  │
│  │  • local_newsletter         → Newsletter subscribers                    │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                      data/products.json (Static Data)                   │  │
│  │  • Main product catalog (read-only)                                     │  │
│  │  • Contains: id, slug, model, type, price, variants[], skus[]           │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USER AUTHENTICATION FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

User Action (Login)
      │
      ▼
┌──────────────────┐
│  LoginPage       │
│  (Component)     │
└────────┬─────────┘
         │ calls
         ▼
┌──────────────────┐
│  useAuth()       │
│  • login()       │
└────────┬─────────┘
         │ reads
         ▼
┌──────────────────┐         ┌──────────────────┐
│  localStorage    │────────▶│  local_users     │
│  (getItem)       │         └──────────────────┘
└────────┬─────────┘
         │ validates credentials
         ▼
┌──────────────────┐
│  localStorage    │
│  (setItem)       │────────▶ local_session (save user)
└────────┬─────────┘
         │ dispatches
         ▼
┌──────────────────┐
│  AuthContext     │
│  dispatch()      │────────▶ { type: 'LOGIN', payload: userData }
└────────┬─────────┘
         │ triggers
         ▼
┌──────────────────┐
│  CartProvider    │
│  useEffect       │────────▶ Merges anonymous cart + user cart
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  UI Re-renders   │
│  (User logged in)│
└──────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                          ADD TO CART FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

User clicks "Add to Cart"
      │
      ▼
┌──────────────────┐
│  ProductPage     │
│  (Component)     │
└────────┬─────────┘
         │ calls
         ▼
┌──────────────────┐
│  useCart()       │
│  • addItem()     │
└────────┬─────────┘
         │ checks stock
         ▼
┌──────────────────┐         ┌──────────────────┐
│  products.json   │◀────────│  getSkuStock()   │
│  + admin products│         └──────────────────┘
└────────┬─────────┘
         │ validates quantity
         ▼
┌──────────────────┐
│  CartContext     │
│  dispatch()      │────────▶ { type: 'UPDATE_CART', payload: updatedItems }
└────────┬─────────┘
         │ triggers useEffect
         ▼
┌──────────────────┐
│  CartProvider    │
│  useEffect       │────────▶ setItem(local_carts_{uid}, items)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  UI Re-renders   │
│  (Cart updated)  │
└──────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                          CHECKOUT FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────┘

User navigates to /checkout
      │
      ▼
┌──────────────────┐
│ CheckoutProvider │────────▶ Reads local_carts_checkout_{uid}
│ (mounts)         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ CheckoutPage     │
│ Step 1: Shipping │────────▶ submitShippingInfo()
│ Step 2: Delivery │────────▶ submitShippingOption()
│ Step 3: Payment  │────────▶ createOrder()
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  useOrder()      │
│  • createOrder() │
└────────┬─────────┘
         │ saves order
         ▼
┌──────────────────┐
│  localStorage    │────────▶ local_orders (append new order)
└────────┬─────────┘
         │ clears cart & session
         ▼
┌──────────────────┐
│  deleteCart()    │────────▶ CartContext dispatch DELETE_CART
│  deleteCheckout  │────────▶ Remove local_carts_checkout_{uid}
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Navigate to     │
│  Order Success   │
└──────────────────┘
```

---

## 🛣️ Routing Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              App.jsx (Routes)                                │
└─────────────────────────────────────────────────────────────────────────────┘

<Routes>
  <Route path="/" element={<Layout />}>
    │
    ├─ index                          → HomePage
    ├─ collections/:id                → CollectionPage
    ├─ products/:id                   → ProductPage (wrapped in ProductProvider)
    ├─ cart                           → CartPage
    │
    ├─ <ProtectedRoutes needAuth={true}>
    │   ├─ checkout                   → CheckoutPage (wrapped in CheckoutProvider)
    │   ├─ account                    → AccountPage
    │   └─ account/addresses          → AddressesPage
    │
    ├─ <ProtectedRoutes needAuth={false}>  (Guest-only)
    │   ├─ account/login              → LoginPage
    │   └─ account/signup             → SignUpPage
    │
    ├─ <ProtectedRoutes needAdmin={true}>
    │   ├─ admin                      → AdminPage
    │   ├─ admin/products/add         → AdminAddProduct
    │   └─ admin/products/:productId  → AdminEditProduct
    │
    └─ *                              → Navigate to="/"
  </Route>
</Routes>


┌─────────────────────────────────────────────────────────────────────────────┐
│                        ProtectedRoutes Logic                                 │
└─────────────────────────────────────────────────────────────────────────────┘

needAdmin={true}
  ├─ isAdmin === true   → <Outlet /> (render children)
  └─ isAdmin === false  → <Navigate to="/" />

needAuth={true}
  ├─ isVerified === true   → <Outlet />
  └─ isVerified === false  → <Navigate to="/account/login" state={pathname} />

needAuth={false}  (Guest-only routes)
  ├─ isVerified === false  → <Outlet />
  └─ isVerified === true   → <Navigate to="/" /> (or redirect to state path)
```

---

## 🧩 Component Hierarchy

```
main.jsx
  └─ Router (BrowserRouter)
      └─ Provider
          └─ AuthProvider
              └─ CartProvider
                  └─ App
                      └─ Routes
                          └─ Layout
                              ├─ Header
                              │   ├─ Navigation
                              │   ├─ Cart Icon (opens drawer)
                              │   └─ User Menu
                              │
                              ├─ Cart (Drawer Modal)
                              │   └─ CartItem (for each item)
                              │
                              ├─ Outlet (Page Content)
                              │   │
                              │   ├─ HomePage
                              │   │   ├─ Hero Section
                              │   │   └─ Featured Products
                              │   │
                              │   ├─ CollectionPage
                              │   │   ├─ Filters (price, size, color)
                              │   │   ├─ Sort Dropdown
                              │   │   └─ ProductCard (grid)
                              │   │
                              │   ├─ ProductPage (ProductProvider)
                              │   │   ├─ ProductSlider (images)
                              │   │   ├─ Variant Selector (colors)
                              │   │   ├─ Size Selector
                              │   │   └─ Add to Cart Button
                              │   │
                              │   ├─ CartPage
                              │   │   ├─ CartItem (list)
                              │   │   ├─ Price Summary
                              │   │   └─ Checkout Button
                              │   │
                              │   ├─ CheckoutPage (CheckoutProvider)
                              │   │   ├─ Step 1: Shipping Info
                              │   │   ├─ Step 2: Delivery Method
                              │   │   └─ Step 3: Payment
                              │   │
                              │   ├─ AccountPage
                              │   │   ├─ Profile Info
                              │   │   ├─ Orders List
                              │   │   └─ Addresses Link
                              │   │
                              │   ├─ AddressesPage
                              │   │   └─ Address CRUD
                              │   │
                              │   ├─ LoginPage / SignUpPage
                              │   │   └─ Auth Forms
                              │   │
                              │   └─ AdminPage
                              │       └─ Product Management
                              │
                              └─ Footer
                                  ├─ Newsletter Signup
                                  └─ Links
```

---

## 📦 Data Models

```javascript
// User Model (localStorage: local_users, local_session)
{
  user: { uid: "uuid", isAnonymous: false },
  name: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "hashed_password",
  phoneNumber: "+1234567890",
  addresses: [
    {
      id: "uuid",
      name: "John",
      lastName: "Doe",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      phoneNumber: "+1234567890",
      isMain: true,
      displayOrder: 1,
      label: "John Doe - 123 Main St - New York, NY 10001"
    }
  ],
  isVerified: true,
  isAdmin: false,
  authIsReady: true
}

// Cart Item Model (localStorage: local_carts_{uid})
[
  {
    productId: "product-uuid",
    variantId: "variant-uuid",
    skuId: "sku-uuid",
    model: "hoodie de gira",
    color: "negro",
    size: "m",
    price: 15000,
    quantity: 2,
    image: { id: "img-id", src: "url" }
  }
]

// Product Model (data/products.json + local_admin_products)
{
  id: "product-uuid",
  slug: "hoodie-de-gira",
  model: "hoodie de gira",
  type: "hoodie",
  collection: "hoodies",
  fit: "regular",
  description: "comfortable hoodie",
  price: 18000,
  createdAt: "2023-08-01T00:00:00.000Z",
  variants: [
    {
      id: "variant-uuid",
      color: "negro",
      variantPrice: 15000,
      images: [
        { id: "img-1", src: "https://..." },
        { id: "img-2", src: "https://..." }
      ],
      skus: [
        { id: "sku-uuid", size: "s", quantity: 10, value: "s", order: 1 },
        { id: "sku-uuid", size: "m", quantity: 5, value: "m", order: 2 },
        { id: "sku-uuid", size: "l", quantity: 0, value: "l", order: 3 }
      ]
    }
  ]
}

// Order Model (localStorage: local_orders)
{
  id: "order-uuid",
  createdAt: "2023-08-15T10:30:00.000Z",
  createdBy: "user-uid",
  items: [...cartItems],
  email: "john@example.com",
  shippingAddress: {...addressObject},
  shippingOption: { standard: true, expedited: false },
  shippingCost: 500,
  paymentInfo: { cardNumber: "****1234", ... },
  billingAddress: {...addressObject}
}

// Checkout Session (localStorage: local_carts_checkout_{uid})
{
  email: "john@example.com",
  shippingAddressId: "address-uuid",
  shippingOption: { standard: false, expedited: true },
  shippingCost: 1000
}
```

---

## 🔐 Security & Access Control

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Access Control Matrix                               │
└─────────────────────────────────────────────────────────────────────────────┘

Route                    │ Anonymous │ Authenticated │ Admin
─────────────────────────┼───────────┼───────────────┼───────
/                        │     ✓     │       ✓       │   ✓
/collections/:id         │     ✓     │       ✓       │   ✓
/products/:id            │     ✓     │       ✓       │   ✓
/cart                    │     ✓     │       ✓       │   ✓
/account/login           │     ✓     │       ✗       │   ✗
/account/signup          │     ✓     │       ✗       │   ✗
/checkout                │     ✗     │       ✓       │   ✓
/account                 │     ✗     │       ✓       │   ✓
/account/addresses       │     ✗     │       ✓       │   ✓
/admin                   │     ✗     │       ✗       │   ✓
/admin/products/*        │     ✗     │       ✗       │   ✓

Legend:
  ✓ = Allowed
  ✗ = Redirected
```

---

## 🎯 Key Design Patterns

1. **Context + Reducer Pattern** (State Management)
   - Replaces Redux with React Context API + useReducer
   - Each domain has its own context (auth, cart, product, checkout)

2. **Custom Hooks as Service Layer** (Business Logic)
   - All API calls and business logic in hooks
   - Components stay presentational and clean

3. **Scoped Providers** (Performance)
   - ProductProvider only wraps ProductPage
   - CheckoutProvider only wraps CheckoutPage
   - Prevents unnecessary re-renders

4. **Protected Routes** (Authorization)
   - Role-based (admin) and auth-based guards
   - Uses React Router v6's Outlet pattern

5. **Optimistic UI Updates** (UX)
   - Cart updates immediately, then persists to localStorage
   - Loading states for async operations

6. **Anonymous User Support** (Conversion)
   - Users can shop without account
   - Cart persists and merges on login

7. **Inventory Management** (Data Integrity)
   - Stock checked on add to cart
   - Re-validated on cart/checkout page load
   - Quantities auto-adjusted if stock changed

---

## 🚀 Performance Optimizations

- **Code Splitting**: ProductProvider and CheckoutProvider only load on their routes
- **Lazy Loading**: Could add React.lazy() for page components (not implemented yet)
- **Memoization**: Could use useMemo/useCallback for expensive calculations
- **Local Storage**: Instant reads, no network latency
- **Reducer Pattern**: Predictable state updates, easier debugging

---

## 📝 Future Improvements (from README issues)

- Real Firebase integration
- Payment gateway (Stripe/PayPal)
- Email notifications
- Product reviews & ratings
- Wishlist functionality
- Search functionality
- Advanced filtering
- Order tracking
- Admin dashboard analytics
- Image optimization
- PWA support
- Unit & integration tests

---

## 🛠️ Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| UI Framework | React 18 |
| Routing | React Router DOM v6 |
| State Management | Context API + useReducer |
| Styling | SASS/SCSS |
| Animations | Framer Motion |
| Build Tool | Vite |
| Database | localStorage (mock) |
| Image Slider | Swiper |
| Icons | React Icons |
| Date Formatting | Moment.js |
| UUID Generation | uuid |
| Form Controls | React Select, React Slider |

