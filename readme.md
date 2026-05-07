Project Overview
A React e-commerce shopping cart app. Originally designed for Firebase, but the current version uses localStorage as the database (no real Firebase calls).

Tech Stack (package.json)
Package	Purpose
React 18	UI library
React Router DOM v6	Client-side routing
Vite	Build tool / dev server
SASS	Styling
Framer Motion	Animations
Swiper	Image sliders
React Icons	Icon library
React Select	Custom dropdowns
React Slider	Price range slider
React Responsive	Media queries in JS
UUID	Generate unique IDs
Moment.js	Date formatting
Entry Point Flow
index.html → main.jsx → Router → Provider → App

Copy
main.jsx — mounts the React app, wraps everything in BrowserRouter and Provider

Provider.jsx — nests AuthProvider → CartProvider → children. These two contexts are global

App.jsx — waits for authIsReady AND cartIsReady before rendering routes. Shows <Loader /> until both are ready

Folder Structure Explained
src/db/config.jsx — The "Database"
No Firebase. Uses localStorage as the database.

Defines keys: local_users, local_session, local_carts, local_orders, etc.

getItem(key) — reads + JSON.parses from localStorage

setItem(key, value) — JSON.stringifies + writes to localStorage

src/context/ — Global State (React Context + useReducer)
AuthProvider (context/auth/)

Manages: user, name, email, addresses, isVerified, isAdmin, authIsReady

On mount: checks localStorage for a saved session. If found → dispatches AUTH_IS_READY. If not → creates an anonymous user with a UUID and dispatches ANONYMOUS_AUTH_IS_READY

Pattern: useReducer with actions like LOGIN, LOGOUT, UPDATE_USER, UPDATE_ADDRESSES

CartProvider (context/cart/)

Manages: items[], cartIsReady, cartNeedsCheck, isLogin

On user change: merges anonymous cart + saved user cart using updateCartAtLogin() (combines duplicate skuIds by summing quantities)

Persists cart to localStorage whenever items changes

Uses useRef(firstLoad) to skip inventory check on first load if already on /cart or /checkout

ProductProvider (context/product/)

Scoped only to the product detail page — wrapped in App.jsx around <ProductPage />

Reads product from products.json + local_admin_products in localStorage

Parses the URL slug (e.g. hoodie-de-gira-negro) → splits last segment as color, rest as product slug

Manages: selectedProduct, selectedVariant, selectedSkuId, selectedSize, singleSize

CheckoutProvider (context/checkout/)

Scoped only to checkout page

Manages a multi-step checkout flow: currentStep (1→2→3)

Persists checkout session to localStorage under key local_carts_checkout_{uid}

Provider.jsx — combines Auth + Cart into one wrapper used in main.jsx

src/hooks/ — Custom Hooks (Business Logic)
useAuth — signup, login, logout

signUp: checks for duplicate email in localStorage, creates user with UUID, saves to local_users + local_session, dispatches LOGIN

login: finds user by email+password in localStorage, dispatches LOGIN

logout: removes session, dispatches LOGOUT + DELETE_CART

useCart — add, remove, delete items

addItem: checks stock from products.json, handles out-of-stock, increments quantity if already in cart

removeItem: decrements quantity or removes item if quantity hits 0

deleteItem: removes item entirely

All operations call saveCart() which dispatches UPDATE_CART or DELETE_CART

useInventory — cart stock validation

checkInventory(items): loops through cart items, checks current stock from products.json, adjusts quantities or removes out-of-stock items, throws a user-friendly error if anything changed

useCollection — product listing

getCollection({ collectionName, sortBy }): reads products.json + admin products, filters by collection, sorts, then flattens all variants into individual cards with computed discount, isSoldOut, slides

useProduct — product detail interactions

selectVariant(variantId): dispatches SELECT_VARIANT, auto-selects size if only one size exists

selectSize({ skuId, value }): dispatches SELECT_SIZE

useCheckout — multi-step checkout

submitShippingInfo: optionally creates a new address, saves to session, advances step

selectShippingOption: toggles standard/expedited

submitShippingOption: saves cost, advances step

deleteCheckoutSession: clears localStorage checkout key

useOrder — order creation & retrieval

createOrder(paymentInfo, billingAddress): saves full order object to local_orders in localStorage, then clears cart + checkout session

getOrders(): returns orders filtered by current user's UID, sorted newest first

useAddress — CRUD for shipping addresses

createAddress: adds address, sets as main if first one, reorders by displayOrder

editAddress: updates address, promotes to main if flagged

deleteAddress: removes, reassigns main if needed

useProfile — edit name/lastName/phoneNumber, syncs to local_users + local_session + AuthContext

useAdmin — admin product management (CRUD)

All operations on local_admin_products in localStorage

createProduct / editProduct / deleteVariant / deleteProduct

useNewsletter — saves email to local_newsletter in localStorage

useKeyDown — utility hook, listens for keyboard events (used for closing modals with Escape key)

src/components/routes/ProtectedRoutes/
Handles 3 cases:

needAdmin=true → only renders if isAdmin, else redirects to /

needAuth=true → only renders if isVerified, else redirects to /account/login with current path as state

needAuth=false (guest-only routes like login/signup) → redirects logged-in users away, but respects redirect back to /checkout or /account

src/components/layouts/Layout/
The shell for all pages:

Renders <Header />, <Footer />, <Cart /> (slide-in drawer), and <Outlet /> (page content)

Hides Header and Footer on the /checkout route

Manages isCartModalOpen state locally, passes open/close handlers to Header and Cart

src/helpers/
format.jsx — formatPrice, formatDiscount (rounds to nearest 5%), formatCardNumber, formatExpiryDate, formatCvv, formatDate (uses moment.js)

item.jsx — price/quantity calculations: addAllItemsPrice, addAllItemsPriceNumber, addAllItemsQuantity

cart.jsx — updateCartAtLogin: merges two cart arrays, sums quantities for duplicate skuIds

error/customError.jsx — custom Error class

error/handleError.jsx — normalizes errors into { details: message } shape

src/data/
products.json — the main product catalog (static JSON, acts as the read-only "database")

dummy-products.json — example/template for seeding data

Key Patterns to Mention in Interview
Context + useReducer pattern — instead of Redux, each domain (auth, cart, product, checkout) has its own context + reducer

Custom hooks as service layer — all business logic is in hooks, components stay clean

localStorage as database — no real backend, everything persists in browser storage

Scoped providers — ProductProvider and CheckoutProvider are only mounted on the routes that need them (not global)

Anonymous user support — users get a UUID even before logging in, cart persists and merges on login

Protected routes — role-based (admin) and auth-based guards using React Router v6's <Outlet />

Inventory management — stock is checked both when adding to cart and when entering cart/checkout pages


