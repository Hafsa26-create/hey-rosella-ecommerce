// =====================================================
// SUPABASE CONNECTION
// =====================================================

const SUPABASE_URL = "https://aktxgvbzmuuatwpimcyz.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_7L4I_QN6C2yyiSjihG9L9Q_FyNBCwVQ";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =====================================================
// CART
// =====================================================

let cart = [];


// =====================================================
// LOAD CART FROM LOCAL STORAGE
// =====================================================

const savedCart = localStorage.getItem("heyRosellaCart");

if (savedCart) {
    try {
        cart = JSON.parse(savedCart);

        if (!Array.isArray(cart)) {
            cart = [];
        }
    } catch (error) {
        console.error("Cart loading error:", error);
        cart = [];
    }
}


// =====================================================
// SAVE CART
// =====================================================

function saveCart() {
    localStorage.setItem(
        "heyRosellaCart",
        JSON.stringify(cart)
    );
}





// =====================================================
// ADD TO CART WITH STOCK CHECK
// =====================================================

async function addToCart(productId, productName, productPrice, button)  {

    try {

        // Get latest stock from Supabase
        const { data, error } = await supabaseClient
            .from("products")
            
            .select("stock_quantity")
                      .eq("id", productId)
                            .single();
        if (error) {

            console.error("Stock check error:", error);

            alert(
                "Unable to check product stock. Please try again."
            );

            return false;
        }

        const availableStock =
            Number(data.stock_quantity) || 0;


        // =================================================
        // OUT OF STOCK
        // =================================================

        if (availableStock <= 0) {

            alert(
                "Sorry, this product is currently out of stock."
            );

            return false;
        }


        // =================================================
        // CHECK CURRENT CART QUANTITY
        // =================================================

        const existingProduct = cart.find(function(product) {
    return String(product.id) === String(productId);
});

        if (existingProduct) {

            // Already reached stock limit
            if (
                Number(existingProduct.quantity) >=
                availableStock
            ) {

                alert(
                    "Only " +
                    availableStock +
                    " item(s) available in stock."
                );

                return false;
            }


            existingProduct.quantity += 1;

        } else {

            cart.push({
               id: String(productId),
                 name: productName,
                   price: Number(productPrice),
                            quantity: 1
                 });

             }


        // =================================================
        // SAVE CART
        // =================================================

        saveCart();

        updateCartCount();

        showCartItems();


        // =================================================
        // BUTTON STATE
        // =================================================

        if (button) {

            button.textContent = "✓ Added";

            button.disabled = true;

            button.style.opacity = "0.7";

            button.style.cursor = "default";

        }


        console.log("Cart:", cart);

        return true;


    } catch (error) {

        console.error(
            "Add to cart error:",
            error
        );

        alert(
            "Something went wrong while adding the product."
        );

        return false;
    }
}


// =====================================================
// ADD TO CART SUCCESS MESSAGE
// =====================================================

function showAddToCartMessage(productName) {

    const message = document.createElement("div");

    message.textContent =
        "✓ " + productName + " added to cart!";

    message.style.position = "fixed";
    message.style.top = "90px";
    message.style.right = "25px";
    message.style.background = "#3e2723";
    message.style.color = "#ffffff";
    message.style.padding = "14px 22px";
    message.style.borderRadius = "8px";
    message.style.fontSize = "15px";
    message.style.zIndex = "9999";
    message.style.boxShadow =
        "0 4px 12px rgba(0,0,0,0.2)";

    document.body.appendChild(message);

    setTimeout(function () {
        message.remove();
    }, 2000);
}


// =====================================================
// UPDATE CART COUNT
// =====================================================

function updateCartCount() {

    let totalItems = 0;

    cart.forEach(function (product) {
        totalItems += Number(product.quantity) || 0;
    });

    const cartCountElement =
        document.getElementById("cart-count");

    if (cartCountElement) {

        if (totalItems > 0) {

            cartCountElement.textContent = totalItems;
            cartCountElement.style.display = "inline-block";

        } else {

            cartCountElement.textContent = "";
            cartCountElement.style.display = "none";
        }
    }
}

// =====================================================
// SHOW CART
// =====================================================

function showCartItems() {

    const cartItems =
        document.getElementById("cart-items");

    const cartTotal =
        document.getElementById("cart-total");

    if (!cartItems || !cartTotal) {
        return;
    }

    cartItems.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <p>Your cart is empty.</p>
        `;

        cartTotal.textContent = "0 BDT";

        return;
    }

    cart.forEach(function (product, index) {

        const item =
            document.createElement("div");

        const price =
            Number(product.price) || 0;

        const quantity =
            Number(product.quantity) || 0;

        const subtotal =
            price * quantity;

        item.innerHTML = `
            <p>
                <strong>${product.name}</strong>

                <br><br>

                Price: ${price} BDT

                <br><br>

                <button
                    type="button"
                    onclick="decreaseQuantity(${index})"
                >
                    −
                </button>

                <span style="margin: 0 12px;">
                    ${quantity}
                </span>

                <button
                    type="button"
                    onclick="increaseQuantity(${index})"
                >
                    +
                </button>

                <br><br>

                Subtotal: ${subtotal} BDT

                <br><br>

                <button
                    type="button"
                    onclick="removeFromCart(${index})"
                >
                    Remove
                </button>
            </p>

            <hr>
        `;

        cartItems.appendChild(item);

        total += subtotal;
    });

    cartTotal.textContent =
        total + " BDT";
}


// =====================================================
// INCREASE QUANTITY WITH STOCK CHECK
// =====================================================

async function increaseQuantity(index) {

    if (!cart[index]) {
        return;
    }

    const product = cart[index];

    try {

        // Get latest stock from Supabase
        const { data, error } = await supabaseClient
            .from("products")
            .select("stock_quantity")
            .eq("id", product.id)
            .single();

        if (error) {
            console.error("Stock check error:", error);
            alert("Unable to check product stock. Please try again.");
            return;
        }

        const availableStock = Number(data.stock_quantity) || 0;

        // Out of stock
        if (availableStock <= 0) {
            alert("Sorry, this product is currently out of stock.");
            return;
        }

        // Maximum stock reached
        if (product.quantity >= availableStock) {
            alert(
                "Only " +
                availableStock +
                " item(s) available in stock."
            );
            return;
        }

        // Increase quantity
        product.quantity += 1;

        saveCart();

        updateCartCount();
        showCartItems();

    } catch (error) {

        console.error("Quantity update error:", error);

        alert(
            "Something went wrong while checking stock."
        );
    }
}


// =====================================================
// DECREASE QUANTITY
// =====================================================

function decreaseQuantity(index) {

    if (!cart[index]) {
        return;
    }

    if (cart[index].quantity > 1) {

        cart[index].quantity -= 1;

    } else {

        cart.splice(index, 1);
    }

    saveCart();

    updateCartCount();
    showCartItems();
}


// =====================================================
// REMOVE PRODUCT
// =====================================================

function removeFromCart(index) {

    if (!cart[index]) {
        return;
    }

    cart.splice(index, 1);

    saveCart();

    updateCartCount();
    showCartItems();
}


// =====================================================
// OPEN CART
// =====================================================

function openCart() {

    showCartItems();

    const cartPopup =
        document.getElementById("cart-popup");

    if (cartPopup) {
        cartPopup.style.display = "block";
    }
}


// =====================================================
// CLOSE CART
// =====================================================

function closeCart() {

    const cartPopup =
        document.getElementById("cart-popup");

    if (cartPopup) {
        cartPopup.style.display = "none";
    }
}


// =====================================================
// CUSTOMER AUTH UI
// =====================================================

function createAuthPopup() {

    if (document.getElementById("auth-popup")) {
        return;
    }

    const authPopup =
        document.createElement("div");

    authPopup.id = "auth-popup";

    authPopup.innerHTML = `
        <div class="auth-box">

            <button
                type="button"
                class="close-auth"
                onclick="closeAuthPopup()"
            >
                ×
            </button>

            <h2 id="auth-title">
                Login 💎
            </h2>

            <p id="auth-message">
                Please login or sign up before placing your order.
            </p>


            <!-- LOGIN -->

            <div id="auth-login-form">

                <input
                    type="email"
                    id="login-email"
                    placeholder="Enter your email"
                >

                <input
                    type="password"
                    id="login-password"
                    placeholder="Enter your password"
                >

                <button
                    type="button"
                    onclick="loginCustomer()"
                >
                    Login
                </button>

                <button
                   type="button"
                   class="resend-button"
                    onclick="resendVerificationEmail()"
                >
            Resend Verification Email
            </button>

            <p>

         <button
            type="button"
               class="auth-switch"
                    onclick="window.location.href='forgot-password.html'"
        >


             Forgot Password?
        </button>
        </p>

        <p>
            Don't have an account?

        <button

        type="button"

        class="auth-switch"

        onclick="showSignupForm()"
        >
        
        Sign Up
    </button>
</p>

            </div>


            <!-- SIGN UP -->

            <div
                id="auth-signup-form"
                style="display: none;"
            >

                <input
                    type="text"
                    id="signup-name"
                    placeholder="Full Name"
                >

                <input
                    type="email"
                    id="signup-email"
                    placeholder="Email Address"
                >

                <input
                    type="password"
                    id="signup-password"
                    placeholder="Create Password"
                >

                <input
                    type="password"
                    id="signup-confirm-password"
                    placeholder="Confirm Password"
                >

                <button
                    type="button"
                    onclick="signupCustomer()"
                >
                    Create Account
                </button>

                <p>
                    Already have an account?

                    <button
                        type="button"
                        class="auth-switch"
                        onclick="showLoginForm()"
                    >
                        Login
                    </button>
                </p>

            </div>


            <!-- VERIFICATION -->

            <div
                id="verification-section"
                style="display: none;"
            >

                <div class="verification-box">

                    <h3>
                        📧 Email Verification
                    </h3>

                    <p id="verification-message">
                        Your verification email has been sent.
                    </p>

                    <button
                        type="button"
                        onclick="verifyLater()"
                    >
                        Verify Later
                    </button>

                    <button
                        type="button"
                        onclick="resendVerificationEmail()"
                    >
                        Resend Verification Email
                    </button>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(authPopup);

    addAuthStyles();
}


// =====================================================
// AUTH STYLES
// =====================================================

function addAuthStyles() {

    if (document.getElementById("auth-styles")) {
        return;
    }

    const style =
        document.createElement("style");

    style.id = "auth-styles";

    style.textContent = `
        #auth-popup {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.55);
            z-index: 9999;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .auth-box {
            position: relative;
            width: 100%;
            max-width: 400px;
            max-height: 90vh;
            overflow-y: auto;
            background: #fff;
            padding: 35px;
            border-radius: 12px;
            box-sizing: border-box;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        .auth-box h2 {
            color: #3e2723;
            margin-top: 0;
        }

        .auth-box h3 {
            color: #3e2723;
        }

        .auth-box p {
            color: #666;
            font-size: 14px;
            line-height: 1.5;
        }

        .auth-box input {
            width: 100%;
            padding: 12px;
            margin: 8px 0;
            border: 1px solid #d4af37;
            border-radius: 6px;
            box-sizing: border-box;
            outline: none;
        }

        .auth-box input:focus {
            border-color: #3e2723;
        }

        .auth-box button:not(.close-auth):not(.auth-switch) {
            width: 100%;
            padding: 12px;
            margin-top: 10px;
            background: #d4af37;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 15px;
        }

        .auth-box button:not(.close-auth):not(.auth-switch):hover {
            background: #3e2723;
        }

        .close-auth {
            position: absolute;
            right: 15px;
            top: 10px;
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #3e2723;
        }

        .auth-switch {
            background: none;
            border: none;
            color: #d4af37;
            cursor: pointer;
            font-weight: bold;
        }

        .verification-box {
            margin-top: 20px;
            padding: 20px;
            background: #fff8e1;
            border-radius: 10px;
            border: 1px solid #d4af37;
        }

        .resend-button {
            background: #3e2723 !important;
        }
    `;

    document.head.appendChild(style);
}


// =====================================================
// SHOW LOGIN FORM
// =====================================================

function showLoginForm() {

    const title =
        document.getElementById("auth-title");

    const loginForm =
        document.getElementById("auth-login-form");

    const signupForm =
        document.getElementById("auth-signup-form");

    const verificationSection =
        document.getElementById("verification-section");

    const message =
        document.getElementById("auth-message");

    if (title) {
        title.textContent = "Login 💎";
    }

    if (loginForm) {
        loginForm.style.display = "block";
    }

    if (signupForm) {
        signupForm.style.display = "none";
    }

    if (verificationSection) {
        verificationSection.style.display = "none";
    }

    if (message) {
        message.textContent =
            "Login to continue with your order.";
    }
}


// =====================================================
// SHOW SIGNUP FORM
// =====================================================

function showSignupForm() {

    const title =
        document.getElementById("auth-title");

    const loginForm =
        document.getElementById("auth-login-form");

    const signupForm =
        document.getElementById("auth-signup-form");

    const verificationSection =
        document.getElementById("verification-section");

    const message =
        document.getElementById("auth-message");

    if (title) {
        title.textContent =
            "Create Your Account ✨";
    }

    if (loginForm) {
        loginForm.style.display = "none";
    }

    if (signupForm) {
        signupForm.style.display = "block";
    }

    if (verificationSection) {
        verificationSection.style.display = "none";
    }

    if (message) {
        message.textContent =
            "Create an account to place your order.";
    }
}


// =====================================================
// SHOW VERIFICATION SECTION
// =====================================================

function showVerificationSection(email) {

    const loginForm =
        document.getElementById("auth-login-form");

    const signupForm =
        document.getElementById("auth-signup-form");

    const verificationSection =
        document.getElementById("verification-section");

    const title =
        document.getElementById("auth-title");

    const message =
        document.getElementById("auth-message");

    const verificationMessage =
        document.getElementById("verification-message");

    if (loginForm) {
        loginForm.style.display = "none";
    }

    if (signupForm) {
        signupForm.style.display = "none";
    }

    if (verificationSection) {
        verificationSection.style.display = "block";
    }

    if (title) {
        title.textContent =
            "Verify Your Email 📧";
    }

    if (message) {
        message.textContent =
            "Your account has been created.";
    }

    if (verificationMessage) {

        verificationMessage.innerHTML = `
            We sent a verification email to:

            <br><br>

            <strong>${email}</strong>

            <br><br>

            Please check your inbox and spam folder.
        `;
    }
}


// =====================================================
// OPEN AUTH POPUP
// =====================================================

function openAuthPopup() {

    createAuthPopup();

    const popup =
        document.getElementById("auth-popup");

    if (popup) {
        popup.style.display = "flex";
    }

    showLoginForm();
}


// =====================================================
// CLOSE AUTH POPUP
// =====================================================

function closeAuthPopup() {

    const popup =
        document.getElementById("auth-popup");

    if (popup) {
        popup.style.display = "none";
    }
}


// =====================================================
// VERIFY LATER
// =====================================================

function verifyLater() {

    alert(
        "You can verify your email later.\n\n" +
        "You can continue shopping and place your order."
    );

    closeAuthPopup();

    openCheckoutAfterLogin();
}


// =====================================================
// SEND VERIFICATION EMAIL
// =====================================================

async function sendVerificationEmail(email) {

    if (!email) {

        alert(
            "Please enter your email address."
        );

        return false;
    }

    const result =
        await supabaseClient.auth.resend({
            type: "signup",
            email: email
        });

    if (result.error) {

        console.error(
            "Verification email error:",
            result.error
        );

        alert(
            "Could not send verification email.\n\n" +
            result.error.message
        );

        return false;
    }

    console.log(
        "Verification email sent:",
        email
    );

    return true;
}


// =====================================================
// RESEND VERIFICATION EMAIL
// =====================================================

async function resendVerificationEmail() {

    const loginEmailElement =
        document.getElementById("login-email");

    const signupEmailElement =
        document.getElementById("signup-email");

    let email = "";

    if (
        loginEmailElement &&
        loginEmailElement.value.trim() !== ""
    ) {

        email =
            loginEmailElement.value.trim();

    } else if (
        signupEmailElement &&
        signupEmailElement.value.trim() !== ""
    ) {

        email =
            signupEmailElement.value.trim();
    }

    if (!email) {

        email =
            prompt(
                "Enter the email address you used to create your account:"
            );
    }

    if (!email) {
        return;
    }

    const sent =
        await sendVerificationEmail(email);

    if (sent) {

        alert(
            "📧 Verification email sent!\n\n" +
            "Please check your inbox and spam folder."
        );
    }
}


/// =====================================================
// CUSTOMER SIGN UP
// =====================================================

async function signupCustomer() {

    const nameElement =
        document.getElementById("signup-name");

    const emailElement =
        document.getElementById("signup-email");

    const passwordElement =
        document.getElementById("signup-password");

    const confirmPasswordElement =
        document.getElementById("signup-confirm-password");


    if (
        !nameElement ||
        !emailElement ||
        !passwordElement ||
        !confirmPasswordElement
    ) {

        console.error(
            "Signup form elements not found."
        );

        return;
    }


    const name =
        nameElement.value.trim();

    const email =
        emailElement.value.trim();

    const password =
        passwordElement.value;

    const confirmPassword =
        confirmPasswordElement.value;


    if (
        !name ||
        !email ||
        !password ||
        !confirmPassword
    ) {

        alert(
            "Please fill in all fields."
        );

        return;
    }


    if (password !== confirmPassword) {

        alert(
            "Passwords do not match."
        );

        return;
    }


    if (password.length < 6) {

        alert(
            "Password must be at least 6 characters."
        );

        return;
    }


    // ================================================
    // CREATE AUTH USER
    // ================================================

    const {
        data,
        error
    } =
        await supabaseClient.auth.signUp({

            email: email,

            password: password,

            options: {

                data: {
                    full_name: name
                }

            }

        });


    if (error) {

        console.error(
            "Signup error:",
            error
        );

        alert(
            "Sign Up failed:\n\n" +
            error.message
        );

        return;
    }


    console.log(
        "Auth signup successful:",
        data
    );


    // ================================================
    // SAVE CUSTOMER TO PROFILES TABLE
    // ================================================

    if (!data.user) {

        console.error(
            "User was not returned after signup."
        );

        alert(
            "Account created, but user information could not be saved."
        );

        return;
    }


    const userId =
        data.user.id;


    const {
        error: profileError
    } =
        await supabaseClient
            .from("profiles")
            .insert({

                id: userId,

                full_name: name

            });


    if (profileError) {

        console.error(
            "Profile insert error:",
            profileError
        );

        alert(
            "Account created, but customer profile could not be saved.\n\n" +
            profileError.message
        );

        return;
    }


    console.log(
        "Customer profile saved successfully."
    );


    alert(
        "Account created successfully! Please verify your email."
    );


    showVerificationSection(email);

}


// =====================================================
// CUSTOMER LOGIN
// =====================================================

async function loginCustomer() {

    const emailElement =
        document.getElementById("login-email");

    const passwordElement =
        document.getElementById("login-password");

    if (!emailElement || !passwordElement) {

        console.error(
            "Login form elements not found."
        );

        return;
    }

    const email =
        emailElement.value.trim();

    const password =
        passwordElement.value;

    if (!email || !password) {

        alert(
            "Please enter your email and password."
        );

        return;
    }

    const result =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (result.error) {

        console.error(
            "Login error:",
            result.error
        );

        alert(
            "Login failed:\n\n" +
            result.error.message
        );

        return;
    }

    console.log(
        "Customer logged in:",
        result.data
    );

    alert(
        "✨ Login successful! ✨"
    );

    closeAuthPopup();

    openCheckoutAfterLogin();
}


// =====================================================
// OPEN CHECKOUT AFTER LOGIN
// =====================================================

async function openCheckoutAfterLogin() {

    if (cart.length === 0) {

        alert(
            "Your cart is empty!"
        );

        return;
    }

    let total = 0;

    cart.forEach(function (product) {

        total +=
            Number(product.price) *
            Number(product.quantity);
    });

    const checkoutTotal =
        document.getElementById("checkout-total");

    if (checkoutTotal) {

        checkoutTotal.textContent =
            total + " BDT";
    }

    const cartPopup =
        document.getElementById("cart-popup");

    const checkoutPopup =
        document.getElementById("checkout-popup");

    if (cartPopup) {
        cartPopup.style.display = "none";
    }

    if (checkoutPopup) {
        checkoutPopup.style.display = "block";
    }
}


// =====================================================
// OPEN CHECKOUT
// =====================================================

async function openCheckout() {

    if (cart.length === 0) {

        alert(
            "Your cart is empty!"
        );

        return;
    }

    const result =
        await supabaseClient.auth.getSession();

    const session =
        result.data.session;

    if (!session) {

        alert(
            "🔐 Please login or sign up before placing your order."
        );

        openAuthPopup();

        return;
    }

    openCheckoutAfterLogin();
}


// =====================================================
// CLOSE CHECKOUT
// =====================================================

function closeCheckout() {

    const checkoutPopup =
        document.getElementById("checkout-popup");

    if (checkoutPopup) {
        checkoutPopup.style.display = "none";
    }
}


// =====================================================
// PLACE ORDER
// =====================================================

function setupCheckoutForm() {

    const checkoutForm =
        document.getElementById("checkout-form");

    if (!checkoutForm) {

        console.log(
            "Checkout form not found."
        );

        return;
    }

    checkoutForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const sessionResult =
                await supabaseClient.auth.getSession();

            const session =
                sessionResult.data.session;

            if (!session) {

                alert(
                    "🔐 Please login or sign up before placing your order."
                );

                closeCheckout();

                openAuthPopup();

                return;
            }


            // CUSTOMER INFORMATION

            const nameElement =
                document.getElementById("customer-name");

            const phoneElement =
                document.getElementById("customer-phone");

            const addressElement =
                document.getElementById("customer-address");

            if (
                !nameElement ||
                !phoneElement ||
                !addressElement
            ) {

                alert(
                    "Delivery form fields are missing."
                );

                return;
            }

            const name =
                nameElement.value.trim();

            const phone =
                phoneElement.value.trim();

            const address =
                addressElement.value.trim();

            if (!name || !phone || !address) {

                alert(
                    "Please fill in all delivery information."
                );

                return;
            }


            // PAYMENT METHOD

            const paymentElement =
                document.querySelector(
                    'input[name="payment"]:checked'
                );

            if (!paymentElement) {

                alert(
                    "Please select a payment method."
                );

                return;
            }

            const payment =
                paymentElement.value;


            // CALCULATE TOTAL

            let total = 0;

            cart.forEach(function (product) {

                total +=
                    Number(product.price) *
                    Number(product.quantity);
            });


            // ORDER NUMBER

            const orderNumber =
                "HR-" + Date.now();




                // =========================================
// CHECK STOCK BEFORE PLACING ORDER
// =========================================

for (const cartItem of cart) {

    const {
        data: product,
        error: productError
    } = await supabaseClient

        .from("products")

        .select(
            "id, name, stock_quantity"
        )

        .eq(
              "id",
                cartItem.id
            )
        .single();


    // PRODUCT NOT FOUND

    if (productError || !product) {

        console.error(
            "Stock check failed:",
            cartItem.name,
            productError
        );

        alert(
            "Sorry! We could not verify the stock for:\n\n" +
            cartItem.name
        );

        return;

    }


    const currentStock =
        Number(
            product.stock_quantity || 0
        );


    const orderQuantity =
        Number(
            cartItem.quantity || 1
        );


    // OUT OF STOCK

    if (currentStock <= 0) {

        alert(
            "🔴 Out of Stock\n\n" +
            cartItem.name +
            "\n\nThis product is currently unavailable."
        );

        return;

    }


    // NOT ENOUGH STOCK

    if (
        orderQuantity >
        currentStock
    ) {

        alert(
            "⚠️ Not Enough Stock\n\n" +
            cartItem.name +
            "\n\n" +
            "Available stock: " +
            currentStock +
            "\n" +
            "Your cart quantity: " +
            orderQuantity +
            "\n\n" +
            "Please reduce the quantity and try again."
        );

        return;

    }

}


// =========================================
// STOCK VERIFIED — CONTINUE ORDER
// =========================================


            // SAVE ORDER TO SUPABASE

           const orderResult =
    await supabaseClient
        .from("Hey Rosella")
        .insert([
            {
                user_id: session.user.id,

                customer_name: name,

                customer_phone: phone,

                customer_address: address,

                payment_method: payment,

                products: cart,

                total_amount: total,

                order_status: "pending",

                order_number: orderNumber
            }
        ]);
                    

            // CHECK ERROR

            if (orderResult.error) {

                console.error(
                    "Order error:",
                    orderResult.error
                );

                alert(
                    "Sorry! Your order could not be placed.\n\n" +
                    orderResult.error.message
                );

                return;
            }

              // =========================================
// REDUCE PRODUCT STOCK AFTER SUCCESSFUL ORDER
// =========================================

// =========================================
// REDUCE PRODUCT STOCK AFTER SUCCESSFUL ORDER
// USING ATOMIC SUPABASE RPC
// =========================================

for (const cartItem of cart) {

    // Find product ID
    const {
        data: product,
        error: productError
    } = await supabaseClient
        .from("products")
        .select("id")
       .eq("id", cartItem.id)
        .single();


    // PRODUCT NOT FOUND
    if (productError || !product) {

        console.error(
            "Could not find product:",
            cartItem.name,
            productError
        );

        continue;
    }


    const orderQuantity =
        Number(cartItem.quantity || 1);


    // ATOMIC STOCK REDUCTION
    const {
        data: stockUpdated,
        error: stockError
    } = await supabaseClient
        .rpc(
            "reduce_product_stock",
            {
                p_product_id: product.id,
                p_quantity: orderQuantity
            }
        );


    // STOCK UPDATE FAILED
    if (stockError) {

        console.error(
            "Stock reduction failed:",
            cartItem.name,
            stockError
        );

        continue;
    }


    // NOT ENOUGH STOCK
    if (stockUpdated !== true) {

        console.error(
            "Stock could not be reduced:",
            cartItem.name
        );

        continue;
    }


    console.log(
        "Stock successfully reduced:",
        cartItem.name,
        "Quantity:",
        orderQuantity
    );

}


            // ORDER SUCCESS

            console.log(
                "Order saved successfully:",
                orderResult.data
            );

            alert(
                "✨ Order Placed Successfully! ✨\n\n" +
                "Order Number: " +
                orderNumber +
                "\n\n" +
                "Thank you for shopping with Hey Rosella 💎" +
                "\n\n" +
                "We will contact you soon."
            );


            // EMPTY CART

            cart = [];

            localStorage.removeItem(
                "heyRosellaCart"
            );

            updateCartCount();
            showCartItems();


            // CLOSE CHECKOUT

            const checkoutPopup =
                document.getElementById("checkout-popup");

            if (checkoutPopup) {
                checkoutPopup.style.display = "none";
            }


            // RESET FORM

            checkoutForm.reset();
        }
    );
}


// =====================================================
// LOGOUT CUSTOMER
// =====================================================

async function logoutCustomer() {

    const result =
        await supabaseClient.auth.signOut();

    if (result.error) {

        console.error(
            "Logout error:",
            result.error
        );

        alert(
            "Could not logout. Please try again."
        );

        return;
    }

    alert(
        "You have been logged out."
    );
}


// =====================================================
// FAQ TOGGLE
// =====================================================

function toggleFAQ(button) {

    const answer =
        button.nextElementSibling;

    if (!answer) {
        return;
    }

    const span =
        button.querySelector("span");

    if (answer.style.display === "block") {

        answer.style.display = "none";

        if (span) {
            span.textContent = "+";
        }

    } else {

        answer.style.display = "block";

        if (span) {
            span.textContent = "−";
        }
    }
}


// =====================================================
// ORDER TRACKING
// =====================================================

async function trackOrder() {

    const orderInput =
        document.getElementById("order-id");

    const result =
        document.getElementById("tracking-result");

    if (!orderInput || !result) {
        return;
    }

    const orderNumber =
        orderInput.value.trim();

    if (orderNumber === "") {

        result.innerHTML = `
            <p>
                Please enter your Order ID.
            </p>
        `;

        return;
    }

    result.innerHTML = `
        <p>
            Checking your order...
        </p>
    `;

    const rpcResult =
        await supabaseClient.rpc(
            "track_order",
            {
                order_id: orderNumber
            }
        );

    if (rpcResult.error) {

        console.error(
            "Tracking error:",
            rpcResult.error
        );

        result.innerHTML = `
            <p>
                Something went wrong.
                Please try again.
            </p>
        `;

        return;
    }

    const data =
        rpcResult.data;

    if (!data || data.length === 0) {

        result.innerHTML = `
            <p>
                ❌ Order not found.
                Please check your Order ID.
            </p>
        `;

        return;
    }

    const order =
        data[0];

    result.innerHTML = `
        <div>

            <h3>
                Order Found! 📦
            </h3>

            <p>
                <strong>Order ID:</strong>
                ${order.order_number}
            </p>

            <p>
                <strong>Status:</strong>
                ${order.order_status}
            </p>

        </div>
    `;
}


// =====================================================
// AUTH STATE LISTENER
// =====================================================

// =====================================================
// AUTH STATE LISTENER
// =====================================================

supabaseClient.auth.onAuthStateChange(
    async function(event, session) {

        console.log(
            "Auth state:",
            event
        );


        const logoutButton =
            document.getElementById(
                "logout-button"
            );


        // =========================================
        // NO SESSION
        // =========================================

        if (!session) {

            console.log(
                "No user logged in."
            );


            if (logoutButton) {

                logoutButton.style.display =
                    "none";

            }

            return;

        }


        // =========================================
        // CHECK USER ROLE
        // =========================================

        const {
            data: profile,
            error
        } = await supabaseClient

            .from("profiles")

            .select("role")

            .eq(
                "id",
                session.user.id
            )

            .single();


        if (error) {

            console.error(
                "Auth role check error:",
                error
            );

            return;

        }


        // =========================================
        // ADMIN
        // =========================================

        if (
            profile &&
            profile.role === "Admin"
        ) {

            console.log(
                "Admin logged in:",
                session.user.email
            );


            // Do NOT treat admin as customer
            if (logoutButton) {

                logoutButton.style.display =
                    "none";

            }

            return;

        }


        // =========================================
        // CUSTOMER
        // =========================================

        console.log(
            "Customer logged in:",
            session.user.email
        );


        console.log(
            "Email verified:",
            !!session.user.email_confirmed_at
        );


        if (logoutButton) {

            logoutButton.style.display =
                "inline-block";

        }

    }
);

// =====================================================
// INITIALIZE WEBSITE
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateCartCount();

        showCartItems();

        setupCheckoutForm();

        console.log(
            "Hey Rosella website loaded successfully."
        );
    }
);


// =====================================================
// CUSTOMER ACCOUNT HELPER
// =====================================================

async function checkCustomerAccount() {
    const result = await supabaseClient.auth.getSession();
    const session = result.data.session;

    return {
        loggedIn: !!session,
        customer: session ? session.user : null
    };
}

// =====================================================
// CUSTOMER PROFILE
// =====================================================

async function openCustomerProfile() {

    console.log("OPEN CUSTOMER PROFILE CALLED");

    const account =
        await checkCustomerAccount();


    if (!account.loggedIn) {

        alert(
            "Please login first."
        );

        openAuthPopup();

        return;

    }


    // =========================================
    // CHECK USER ROLE
    // =========================================

    const {
        data: profile,
        error
    } = await supabaseClient

        .from("profiles")

        .select("role")

        .eq(
            "id",
            account.customer.id
        )

        .single();

        console.log(
    "CURRENT USER ID:",
    account.customer.id
);

console.log(
    "PROFILE ROLE:",
    profile?.role
);


    if (error) {

        console.error(
            "Role check error:",
            error
        );

        return;

    }


    // =========================================
    // ADMIN SHOULD NOT USE CUSTOMER PROFILE
    // =========================================

    if (
        profile &&
        profile.role === "Admin"
    ) {

        alert(
            "Admin account detected. Please use the Admin Dashboard."
        );

        window.location.href =
            "admin.html";

        return;

    }


    // =========================================
    // CUSTOMER PROFILE
    // =========================================

    const section =
        document.getElementById(
            "customer-profile-section"
        );


    if (section) {

        section.style.display =
            "block";

    }


    console.log(
        "Customer profile opened:",
        account.customer.email
    );

}
function closeCustomerProfile() {
    const section = document.getElementById("customer-profile-section");

    if (section) {
        section.style.display = "none";
    }
}

// =====================================================
// CHANGE PASSWORD
// =====================================================

async function changeCustomerPassword(currentPassword, newPassword, confirmPassword) {
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert("Please fill in all password fields.");
        return false;
    }

    if (newPassword !== confirmPassword) {
        alert("Passwords do not match.");
        return false;
    }

    if (newPassword.length < 6) {
        alert("Password must be at least 6 characters.");
        return false;
    }

    const result = await supabaseClient.auth.updateUser({
        password: newPassword
    });

    if (result.error) {
        alert(result.error.message);
        return false;
    }

    alert("Password changed successfully.");
    return true;
}

// =====================================================
// FORGOT PASSWORD
// =====================================================

async function forgotCustomerPassword(email) {
    if (!email) {
        alert("Enter your email.");
        return false;
    }

    const result = await supabaseClient.auth.resetPasswordForEmail(email);

    if (result.error) {
        alert(result.error.message);
        return false;
    }

    alert("Password reset email sent.");
    return true;
}

// =====================================================
// RESET PASSWORD
// =====================================================

async function resetCustomerPassword(newPassword, confirmPassword) {
    if (!newPassword || !confirmPassword) {
        alert("Please enter your new password and confirm password.");
        return false;
    }

    if (newPassword !== confirmPassword) {
        alert("Passwords do not match.");
        return false;
    }

    if (newPassword.length < 6) {
        alert("Password must be at least 6 characters.");
        return false;
    }

    const result = await supabaseClient.auth.updateUser({
        password: newPassword
    });

    if (result.error) {
        alert(result.error.message);
        return false;
    }

    alert("Your password has been reset successfully!");
    return true;
}

// =====================================================
// MY ORDERS
// =====================================================

async function openMyOrders() {

    const account =
        await checkCustomerAccount();

    if (!account.loggedIn) {

        alert(
            "Please login to view your orders."
        );

        openAuthPopup();

        return;
    }

    closeAllCustomerForms();

    const section =
        document.getElementById(
            "my-orders-section"
        );

    if (section) {

        section.style.display = "block";

    }
}


// =====================================================
// CLOSE MY ORDERS
// =====================================================

function closeMyOrders() {

    const section =
        document.getElementById(
            "my-orders-section"
        );

    if (section) {

        section.style.display = "none";

    }
}

// =====================================================
// ORDER DETAILS
// =====================================================

async function openOrderDetails(orderNumber) {
    if (!orderNumber) {
        alert("Order number is missing.");
        return;
    }

    const section = document.getElementById("order-details-section");

    if (section) {
        section.style.display = "block";
    }

    console.log("Opening order:", orderNumber);
}

function closeOrderDetails() {
    const section = document.getElementById("order-details-section");

    if (section) {
        section.style.display = "none";
    }
}

// =====================================================
// PRODUCT SEARCH + FILTER
// =====================================================

let currentSearchTerm = "";
let currentCategory = "all";
let currentSort = "default";

function setProductSearch(searchTerm) {
    currentSearchTerm = searchTerm.trim().toLowerCase();
    applyProductFilters();
}

function setProductCategory(category) {
    currentCategory = category.trim().toLowerCase();
    applyProductFilters();
}

function applyProductFilters() {
    console.log("Search:", currentSearchTerm);
    console.log("Category:", currentCategory);
}

function clearProductFilters() {
    currentSearchTerm = "";
    currentCategory = "all";
    applyProductFilters();
}

// =====================================================
// PRODUCT SORTING
// =====================================================

function setProductSort(sortType) {
    currentSort = sortType;
    applyProductSorting();
}

function applyProductSorting() {
    console.log("Sort:", currentSort);
}

function resetProductSort() {
    currentSort = "default";
    applyProductSorting();
}

// =====================================================
// WISHLIST SYSTEM
// =====================================================

let wishlist = [];

// Load wishlist from localStorage
function loadWishlistData() {

    const savedWishlist =
        localStorage.getItem("heyRosellaWishlist");

    if (savedWishlist) {

        try {

            wishlist =
                JSON.parse(savedWishlist) || [];

        } catch (error) {

            console.error(
                "Wishlist loading error:",
                error
            );

            wishlist = [];
        }

    } else {

        wishlist = [];

    }

}


// Save wishlist

function saveWishlist() {

    localStorage.setItem(
        "heyRosellaWishlist",
        JSON.stringify(wishlist)
    );

}


// Add product to wishlist

function addToWishlist
(
    productId,
    productName,
    productPrice,
    productImage = ""
) 

{

    // Check if already exists
 
    const alreadyExists =
    wishlist.some(function(product) 
    {

        return String(product.id) === String(productId);

    });


    if (alreadyExists) {

        return false;

    }


    // Add product
    
    wishlist.push(
        {
            id: String(productId),
             name: productName,
              price: Number(productPrice) || 0,
                image: productImage || ""
       }
            );

    // Save
    saveWishlist();


    // Refresh wishlist page if open
    renderWishlist();


    return true;

}






// =====================================================
// REMOVE WISHLIST ITEM
// =====================================================

function removeWishlistItem(productName) {

    removeFromWishlist(productName);

}




// =====================================================
// INITIALIZE WISHLIST
// =====================================================

loadWishlistData();


// If wishlist page is open
document.addEventListener(
    "DOMContentLoaded",
    function() {

        renderWishlist();

    }
);
// =====================================================
// RECENTLY VIEWED
// =====================================================

let recentlyViewed = [];

const savedRecentlyViewed = localStorage.getItem("heyRosellaRecentlyViewed");

if (savedRecentlyViewed) {
    try {
        recentlyViewed = JSON.parse(savedRecentlyViewed);
    } catch {
        recentlyViewed = [];
    }
}

function addToRecentlyViewed(productName, productPrice, productImage = "") {
    recentlyViewed = recentlyViewed.filter(p => p.name !== productName);

    recentlyViewed.unshift({
        name: productName,
        price: productPrice,
        image: productImage
    });

    recentlyViewed = recentlyViewed.slice(0, 6);

    localStorage.setItem(
        "heyRosellaRecentlyViewed",
        JSON.stringify(recentlyViewed)
    );
}


// =====================================================
// OPEN CUSTOMER PROFILE
// =====================================================

async function openCustomerProfile() {

    const result =
        await supabaseClient.auth.getSession();

    const session =
        result.data.session;


    // =========================================
    // NO LOGIN
    // =========================================

    if (!session) {

        alert(
            "Please login to view your account."
        );

        openAuthPopup();

        return;
    }


    // =========================================
    // CHECK USER ROLE
    // =========================================

    const {
        data: profile,
        error
    } = await supabaseClient

        .from("profiles")

        .select("role")

        .eq(
            "id",
            session.user.id
        )

        .single();


    if (error) {

        console.error(
            "Role check error:",
            error
        );

        return;
    }


    // =========================================
    // ADMIN ACCOUNT
    // =========================================

    if (
        profile &&
        profile.role === "Admin"
    ) {

        alert(
            "Admin account detected. Opening Admin Dashboard..."
        );

        window.location.href =
            "admin.html";

        return;
    }


    // =========================================
    // CUSTOMER ACCOUNT
    // =========================================

    closeAllCustomerForms();


    const popup =
        document.getElementById(
            "customer-account-popup"
        );


    const profileName =
        document.getElementById(
            "profile-name"
        );


    const profileEmail =
        document.getElementById(
            "profile-email"
        );


    if (profileName) {

        profileName.textContent =
            session.user.user_metadata?.full_name ||
            "Customer";

    }


    if (profileEmail) {

        profileEmail.textContent =
            session.user.email || "";

    }


    if (popup) {

        popup.style.display =
            "flex";

    }

}


// =====================================================
// CLOSE CUSTOMER PROFILE
// =====================================================

function closeCustomerProfile() {

    const popup =
        document.getElementById(
            "customer-account-popup"
        );


    if (popup) {

        popup.style.display =
            "none";

    }
}


// =====================================================
// SHOW CHANGE PASSWORD
// =====================================================

function showChangePasswordForm() {

    closeAllCustomerForms();

    const section =
        document.getElementById(
            "change-password-section"
        );

    if (section) {

        section.style.display = "block";

    }
}

// =====================================================
// HANDLE CHANGE PASSWORD
// =====================================================

async function handleChangePassword() {

    const newPassword =
        document.getElementById(
            "new-password"
        ).value;


    const confirmPassword =
        document.getElementById(
            "confirm-new-password"
        ).value;


    if (!newPassword || !confirmPassword) {

        alert(
            "Please fill in all password fields."
        );

        return;
    }


    if (newPassword !== confirmPassword) {

        alert(
            "Passwords do not match."
        );

        return;
    }


    if (newPassword.length < 6) {

        alert(
            "Password must be at least 6 characters."
        );

        return;
    }


    const {
        error
    } =
        await supabaseClient.auth.updateUser({

            password: newPassword

        });


    if (error) {

        console.error(
            "Password update error:",
            error
        );

        alert(
            "Could not change password.\n\n" +
            error.message
        );

        return;
    }


    alert(
        "🔐 Password changed successfully!"
    );


    document.getElementById(
        "current-password"
    ).value = "";


    document.getElementById(
        "new-password"
    ).value = "";


    document.getElementById(
        "confirm-new-password"
    ).value = "";


    document.getElementById(
        "change-password-section"
    ).style.display = "none";
}


function showEditProfileForm() {

    closeAllCustomerForms();

    const section =
        document.getElementById(
            "edit-profile-section"
        );

    if (section) {

        section.style.display = "block";

    }
}


// =====================================================
// SAVE CUSTOMER PROFILE
// =====================================================

async function saveCustomerProfile() {

    const name =
        document.getElementById(
            "edit-profile-name"
        ).value.trim();

    const phone =
        document.getElementById(
            "edit-profile-phone"
        ).value.trim();


    if (!name) {

        alert("Please enter your name.");

        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient.auth.updateUser({

            data: {
                full_name: name,
                phone: phone
            }

        });


    if (error) {

        console.error(
            "Profile update error:",
            error
        );

        alert(error.message);

        return;
    }


    const profileName =
        document.getElementById(
            "profile-name"
        );


    if (profileName) {

        profileName.textContent =
            name;

    }


    alert(
        "✨ Profile updated successfully!"
    );


    document.getElementById(
        "edit-profile-section"
    ).style.display = "none";
}


// =====================================================
// FORGOT PASSWORD FORM
// =====================================================

function showForgotPasswordForm() {

    closeAllCustomerForms();

    const section =
        document.getElementById(
            "forgot-password-section"
        );

    if (section) {

        section.style.display = "block";

    }
}


// =====================================================
// SEND PASSWORD RESET LINK
// =====================================================

async function handleForgotPassword() {

    const email =
        document.getElementById(
            "forgot-password-email"
        ).value.trim();


    if (!email) {

        alert(
            "Please enter your email address."
        );

        return;
    }


    const {
        error
    } =
        await supabaseClient.auth.resetPasswordForEmail(
            email
        );


    if (error) {

        console.error(
            "Forgot password error:",
            error
        );

        alert(
            "Could not send reset link.\n\n" +
            error.message
        );

        return;
    }


    alert(
        "📧 Password reset link has been sent to your email!"
    );


    document.getElementById(
        "forgot-password-section"
    ).style.display = "none";
}



// =====================================================
// CLOSE ALL CUSTOMER ACCOUNT FORMS
// =====================================================

function closeAllCustomerForms() {

    const sections = [
        "edit-profile-section",
        "forgot-password-section",
        "change-password-section",
        "my-orders-section"
    ];

    sections.forEach(function(id) {

        const element =
            document.getElementById(id);

        if (element) {

            element.style.display = "none";

        }

    });
}


// =====================================================
// OPEN ACCOUNT FROM OTHER PAGES
// =====================================================

function openAccountFromOtherPage() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    if (
        params.get("openAccount") === "true"
    ) {

        setTimeout(function () {

            openCustomerProfile();

        }, 300);

    }
}


window.addEventListener(
    "load",
    openAccountFromOtherPage
);



// =====================================================
// HOME ACCOUNT BUTTON
// =====================================================

async function openAccountPage() {

    const {
        data,
        error
    } = await supabaseClient.auth.getSession();


    // =========================================
    // SESSION ERROR
    // =========================================

    if (error) {

        console.error(
            "Account session error:",
            error
        );

        return;

    }


    // =========================================
    // NO USER LOGGED IN
    // =========================================

    if (!data.session) {

        openAuthPopup();

        return;

    }


    // =========================================
    // CHECK USER ROLE
    // =========================================

    const {
        data: profile,
        error: profileError
    } = await supabaseClient

        .from("profiles")

        .select("role")

        .eq(
            "id",
            data.session.user.id
        )

        .single();


    // =========================================
    // PROFILE ERROR
    // =========================================

    if (profileError) {

        console.error(
            "Account role check error:",
            profileError
        );

        return;

    }


    // =========================================
    // ADMIN ACCOUNT
    // =========================================

    if (
        profile &&
        profile.role === "Admin"
    ) {

        console.log(
            "Admin account detected."
        );

        window.location.href =
            "admin.html";

        return;

    }


    // =========================================
    // CUSTOMER ACCOUNT
    // =========================================

    window.location.href =
        "my-account.html";

}










// =====================================================
// LOAD WISHLIST PAGE
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadProducts();

        renderWishlist();

        updateCartCount();

        console.log(
            "Hey Rosella products initialized."
        );

    }
);


// =====================================================
// SMART PRODUCT SEARCH
// =====================================================

function searchProducts() {

    const searchInput =
        document.getElementById("search-input");

    if (!searchInput) {
        return;
    }

    const searchText =
        searchInput.value.toLowerCase().trim();

    const productCards =

    
        document.querySelectorAll(
            ".product-card, .shop-card"
        );

    let foundProducts = 0;

    productCards.forEach(function (card) {

        const productNameElement =
            card.querySelector("h3");

        if (!productNameElement) {
            return;
        }

        const productName =
            productNameElement.textContent
                .toLowerCase()
                .trim();

        // =============================================
        // CATEGORY KEYWORDS
        // =============================================

        let category = "";

        if (
            productName.includes("jhumka") ||
            productName.includes("jhumki")
        ) {
            category = "jhumka earrings";
        }

        else if (
            productName.includes("earring")
        ) {
            category = "earrings";
        }

        else if (
            productName.includes("ring")
        ) {
            category = "rings";
        }

        else if (
            productName.includes("pendant")
        ) {
            category = "pendant necklace";
        }

        else if (
            productName.includes("necklace")
        ) {
            category = "necklace";
        }

        else if (
            productName.includes("bracelet")
        ) {
            category = "bracelet";
        }

        // =============================================
        // SEARCH MATCH
        // =============================================

        const searchWords =
            searchText.split(" ");

        const matchesProduct =
            searchWords.every(function (word) {

                return (
                    productName.includes(word) ||
                    category.includes(word)
                );

            });

        // =============================================
        // SHOW / HIDE PRODUCT
        // =============================================

        if (
            searchText === "" ||
            matchesProduct
        ) {

            card.style.display = "";

            foundProducts++;

        } else {

            card.style.display = "none";
        }
    });

    // =============================================
    // NO RESULT MESSAGE
    // =============================================

    let noResult =
        document.getElementById("no-search-result");

    if (!noResult) {

        noResult =
            document.createElement("p");

        noResult.id =
            "no-search-result";

        noResult.textContent =
            "No products found.";

        noResult.style.color =
            "#38221e";

        noResult.style.fontSize =
            "18px";

        noResult.style.fontWeight =
            "bold";

        noResult.style.marginTop =
            "30px";

        const shopSection =
            document.querySelector(".shop");

        if (shopSection) {
            shopSection.appendChild(noResult);
        }
    }

    if (
        searchText !== "" &&
        foundProducts === 0
    ) {

        noResult.style.display =
            "block";

    } else {

        noResult.style.display =
            "none";
    }
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================================
// WISHLIST STORAGE
// =====================================================

function getWishlist() {

    try {

        const saved =
            localStorage.getItem("heyRosellaWishlist");

        if (!saved) {
            return [];
        }

        const data = JSON.parse(saved);

        return Array.isArray(data) ? data : [];

    } catch (error) {

        console.error(
            "Wishlist loading error:",
            error
        );

        return [];
    }
}


  

// =====================================================
// SAVE WISHLIST
// =====================================================

function saveWishlist(wishlistData) {

    localStorage.setItem(
        "heyRosellaWishlist",
        JSON.stringify(wishlistData)
    );

}


// =====================================================
// ADD TO WISHLIST
// =====================================================

function addToWishlist(
    productName,
    productPrice,
    productImage = "",
    productId = ""
) {

    let wishlist = getWishlist();

    const exists = wishlist.some(function(product) {

        return (
            String(product.id) === String(productId) &&
            productId !== ""
        ) || (
            productId === "" &&
            product.name === productName
        );

    });


    if (exists) {

        return false;

    }


    wishlist.push({

        id: String(productId),

        name: productName,

        price: Number(productPrice) || 0,

        image: productImage || ""

    });


    saveWishlist(wishlist);

    return true;

}


// =====================================================
// REMOVE FROM WISHLIST
// =====================================================

function removeFromWishlist(productName) {

    let wishlist = getWishlist();

    wishlist = wishlist.filter(function(product) {

        return product.name !== productName;

    });

    saveWishlist(wishlist);

    renderWishlist();

    updateWishlistButtons();

}


// =====================================================
// HANDLE WISHLIST CLICK
// =====================================================

function handleWishlistClick(
    productId,
    productName,
    productPrice,
    productImage,
    button
) {

    let wishlist = getWishlist();

    const existingIndex =
        wishlist.findIndex(function(product) {

            return String(product.id) ===
                String(productId);

        });


    // =================================================
    // REMOVE
    // =================================================

    if (existingIndex !== -1) {

        wishlist.splice(
            existingIndex,
            1
        );

        saveWishlist(wishlist);


        if (button) {

            button.textContent = "♡ Wishlist";

            button.style.backgroundColor =
                "white";

            button.style.color =
                "#3e2723";

        }


        showWishlistMessage(
            productName +
            " removed from wishlist."
        );

        return;

    }


    // =================================================
    // ADD
    // =================================================

    wishlist.push({

        id: String(productId),

        name: productName,

        price: Number(productPrice) || 0,

        image: productImage || ""

    });


    saveWishlist(wishlist);


    if (button) {

        button.textContent =
            "♥ Added to Wishlist";

        button.style.backgroundColor =
            "#3e2723";

        button.style.color =
            "white";

    }


    showWishlistMessage(
        productName +
        " added to wishlist!"
    );

}


// =====================================================
// UPDATE WISHLIST BUTTONS
// =====================================================

function updateWishlistButtons() {

    const wishlist = getWishlist();

    const buttons =
        document.querySelectorAll(
            ".wishlist-dynamic-btn"
        );


    buttons.forEach(function(button) {

        const productId =
            String(
                button.dataset.productId || ""
            );


        const exists =
            wishlist.some(function(product) {

                return String(product.id) ===
                    productId;

            });


        if (exists) {

            button.textContent =
                "♥ Added to Wishlist";

            button.style.backgroundColor =
                "#3e2723";

            button.style.color =
                "white";

        } else {

            button.textContent =
                "♡ Wishlist";

            button.style.backgroundColor =
                "white";

            button.style.color =
                "#3e2723";

        }

    });

}


// =====================================================
// WISHLIST MESSAGE
// =====================================================

function showWishlistMessage(messageText) {

    const message =
        document.createElement("div");


    message.textContent =
        "✓ " + messageText;


    message.style.position =
        "fixed";

    message.style.top =
        "90px";

    message.style.right =
        "25px";

    message.style.background =
        "#3e2723";

    message.style.color =
        "white";

    message.style.padding =
        "14px 22px";

    message.style.borderRadius =
        "8px";

    message.style.fontSize =
        "14px";

    message.style.zIndex =
        "99999";

    message.style.boxShadow =
        "0 4px 12px rgba(0,0,0,0.2)";


    document.body.appendChild(
        message
    );


    setTimeout(function() {

        message.remove();

    }, 2000);

}


// =====================================================
// PRODUCT CARD
// =====================================================

function createProductCard(
    product,
    type
) {

    const productId =
        String(product.id);


    const productName =
        String(
            product.name || "Product"
        );


    const productPrice =
        Number(product.price) || 0;


    const productImage =
        product.image_url || "";


    const card =
        document.createElement("div");


    card.className =
        type === "featured"
            ? "product-card"
            : "shop-card";


    const imageClass =
        type === "featured"
            ? "product-image"
            : "shop-image";


    const imageHTML =
        productImage

            ? `

                <img
                    src="${escapeHTML(productImage)}"
                    alt="${escapeHTML(productName)}"
                    style="
                        width:100%;
                        height:100%;
                        object-fit:cover;
                        border-radius:10px;
                    "
                    onerror="
                        this.style.display='none';
                        this.parentElement.innerHTML='<span>No Image</span>';
                    "
                >

            `

            :

            `

                <span>No Image</span>

            `;


    card.innerHTML = `

        <div class="${imageClass}">

            ${imageHTML}

        </div>


        <h3>
            ${escapeHTML(productName)}
        </h3>


        <p>
            ৳${productPrice.toLocaleString("en-BD")}
        </p>


        <div
            style="
                display:flex;
                gap:8px;
                justify-content:center;
                align-items:center;
                flex-wrap:wrap;
            "
        >

            <!-- ADD TO CART -->

            <button
                type="button"
                class="add-cart-dynamic-btn"
            >
                Add to Cart
            </button>


            <!-- WISHLIST -->

            <button
                type="button"
                class="wishlist-dynamic-btn"
                data-product-id="${escapeHTML(productId)}"
                title="Add to Wishlist"
            >
                ♡ Wishlist
            </button>

        </div>

    `;


    // =================================================
// CART BUTTON + STOCK STATUS
// =================================================

const cartButton =
    card.querySelector(
        ".add-cart-dynamic-btn"
    );


const stock =
    Number(
        product.stock_quantity || 0
    );


// =========================================
// OUT OF STOCK
// =========================================

if (
    cartButton &&
    stock <= 0
) {

    cartButton.textContent =
        "🔴 Out of Stock";

    cartButton.disabled =
        true;

    cartButton.style.backgroundColor =
        "#777";

    cartButton.style.color =
        "white";

    cartButton.style.cursor =
        "not-allowed";

    cartButton.style.opacity =
        "0.7";

}


// =========================================
// IN STOCK
// =========================================

else if (cartButton) {

    cartButton.addEventListener(
        "click",
        function() {

           addToCart(
              product.id,
                productName,
                  productPrice,
                    cartButton
            );


            cartButton.textContent =
                "✓ Added";


            cartButton.style.backgroundColor =
                "#3e2723";


            setTimeout(function() {

                cartButton.textContent =
                    "Add to Cart";

                cartButton.style.backgroundColor =
                    "";

            }, 1500);

        }
    );

}


    // =================================================
    // WISHLIST BUTTON
    // =================================================

    const wishlistButton =
        card.querySelector(
            ".wishlist-dynamic-btn"
        );


    if (wishlistButton) {

        const wishlist =
            getWishlist();


        const alreadyAdded =
            wishlist.some(function(item) {

                return String(item.id) ===
                    String(productId);

            });


        if (alreadyAdded) {

            wishlistButton.textContent =
                "♥ Added to Wishlist";

            wishlistButton.style.backgroundColor =
                "#3e2723";

            wishlistButton.style.color =
                "white";

        }


        wishlistButton.addEventListener(
            "click",
            function() {

                handleWishlistClick(
                    productId,
                    productName,
                    productPrice,
                    productImage,
                    wishlistButton
                );

            }
        );

    }


    return card;

}


// =====================================================
// LOAD PRODUCTS FROM SUPABASE
// =====================================================

async function loadProducts() {

    const shopContainer =
        document.getElementById(
            "shop-products"
        );


    const featuredContainer =
        document.getElementById(
            "products-container"
        );


    if (
        !shopContainer &&
        !featuredContainer
    ) {

        console.log(
            "Product containers not found."
        );

        return;

    }


    // =================================================
    // LOAD FROM SUPABASE
    // =================================================

    try {

        const {
            data: products,
            error
        } = await supabaseClient
            .from("products")
            .select("*")
            .eq("is_active", true)
            .order("created_at", {
                ascending: false
            });


        // =================================================
        // ERROR
        // =================================================

        if (error) {

            console.error(
                "Product loading error:",
                error
            );


            if (shopContainer) {

                shopContainer.innerHTML =
                    "<p>Unable to load products.</p>";

            }


            if (featuredContainer) {

                featuredContainer.innerHTML =
                    "<p>Unable to load products.</p>";

            }


            return;

        }


        // =================================================
        // NO PRODUCTS
        // =================================================

        if (
            !products ||
            products.length === 0
        ) {

            if (shopContainer) {

                shopContainer.innerHTML =
                    "<p>No products available.</p>";

            }


            if (featuredContainer) {

                featuredContainer.innerHTML =
                    "<p>No products available.</p>";

            }


            return;

        }


        // =================================================
        // SHOP PRODUCTS
        // =================================================

        if (shopContainer) {

            shopContainer.innerHTML = "";


            products.forEach(function(product) {

                const card =
                    createProductCard(
                        product,
                        "shop"
                    );


                shopContainer.appendChild(
                    card
                );

            });

        }


        // =================================================
        // FEATURED COLLECTION
        // =================================================

        if (featuredContainer) {

            featuredContainer.innerHTML = "";


            const featuredProducts =
                products.slice(0, 3);


            featuredProducts.forEach(
                function(product) {

                    const card =
                        createProductCard(
                            product,
                            "featured"
                        );


                    featuredContainer.appendChild(
                        card
                    );

                }
            );

        }


        // =================================================
        // UPDATE WISHLIST BUTTONS
        // =================================================

        updateWishlistButtons();


        console.log(
            "Products loaded successfully:",
            products.length
        );

    }


    catch (error) {

        console.error(
            "Unexpected product loading error:",
            error
        );


        if (shopContainer) {

            shopContainer.innerHTML =
                "<p>Unable to load products.</p>";

        }


        if (featuredContainer) {

            featuredContainer.innerHTML =
                "<p>Unable to load products.</p>";

        }

    }

}


// =====================================================
// LOAD WISHLIST PAGE
// =====================================================

function renderWishlist() {

    const container =
        document.getElementById(
            "wishlist-items"
        );

    const emptyMessage =
        document.getElementById(
            "empty-wishlist"
        );

    if (!container) {
        return;
    }

    const wishlist =
        getWishlist();

    container.innerHTML = "";


    // =================================================
    // EMPTY WISHLIST
    // =================================================

    if (wishlist.length === 0) {

        if (emptyMessage) {

            emptyMessage.style.display =
                "block";

        }

        return;
    }


    if (emptyMessage) {

        emptyMessage.style.display =
            "none";

    }


    // =================================================
    // RENDER WISHLIST PRODUCTS
    // =================================================

    wishlist.forEach(function(product) {

        const item =
            document.createElement("div");

        item.className =
            "wishlist-item";


        // =================================================
        // PRODUCT IMAGE
        // =================================================

        const imageHTML =
            product.image

                ? `
                    <img
                        src="${escapeHTML(product.image)}"
                        alt="${escapeHTML(product.name)}"
                        style="
                            width:100%;
                            height:100%;
                            object-fit:cover;
                            border-radius:10px;
                        "
                    >
                `

                : `

                    <span>No Image</span>

                `;


        // =================================================
        // HTML
        // =================================================

        item.innerHTML = `

            <div class="wishlist-image">

                ${imageHTML}

            </div>


            <h3>
                ${escapeHTML(product.name)}
            </h3>


            <div class="wishlist-price">

                ৳${Number(
                    product.price || 0
                ).toLocaleString("en-BD")}

            </div>


            <button
                type="button"
                class="wishlist-cart-button"
            >
                🛒 Add to Cart
            </button>


            <button
                type="button"
                class="remove-button"
            >
                💔 Remove
            </button>

        `;


        // =================================================
        // ADD TO CART
        // =================================================

        const cartButton =
            item.querySelector(
                ".wishlist-cart-button"
            );


        if (cartButton) {

    cartButton.addEventListener(
        "click",
        async function() {

            const added = await addToCart
                    (
                      product.id,
                        product.name,
                         product.price,
                           cartButton
                    );

           
            if (!added) 
                {
                return;
                }

            
            removeFromWishlist(
                product.name
            );

            // SUCCESS STATE
            cartButton.textContent =
                "✓ Added to Cart";

            cartButton.style.backgroundColor =
                "#3e2723";

            cartButton.style.color =
                "white";

        }
    );

}


        // =================================================
        // REMOVE BUTTON
        // =================================================

        const removeButton =
            item.querySelector(
                ".remove-button"
            );


        if (removeButton) {

            removeButton.addEventListener(
                "click",
                function() {

                    removeFromWishlist(
                        product.name
                    );

                }
            );

        }


        container.appendChild(item);

    });

}
// =====================================================
// INITIALIZE WEBSITE
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadProducts();

        renderWishlist();

        updateCartCount();

        console.log(
            "Hey Rosella products initialized."
        );

    }
);