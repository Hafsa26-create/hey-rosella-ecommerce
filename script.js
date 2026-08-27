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

function addToCart(productName, productPrice, button) {

    const existingProduct = cart.find(function (product) {
        return product.name === productName;
    });

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: Number(productPrice),
            quantity: 1
        });
    }

    saveCart();

    updateCartCount();
    showCartItems();

    // Change button temporarily
    if (button) {

        const originalText = button.textContent;

        button.textContent = "✓ Added";
        button.disabled = true;
        button.style.opacity = "0.7";
        button.style.cursor = "default";

        setTimeout(function () {

            button.textContent = originalText;
            button.disabled = false;
            button.style.opacity = "1";
            button.style.cursor = "pointer";

        }, 4000);
    }

    // Show success message
    showAddToCartMessage(productName);

    console.log("Cart:", cart);
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
// INCREASE QUANTITY
// =====================================================

function increaseQuantity(index) {

    if (!cart[index]) {
        return;
    }

    cart[index].quantity += 1;

    saveCart();

    updateCartCount();
    showCartItems();
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


// =====================================================
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

        console.error("Signup form elements not found.");

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

    const result =
        await supabaseClient.auth.signUp({
            email: email,
            password: password,

            options: {
                data: {
                    full_name: name
                }
            }
        });

    if (result.error) {

        console.error(
            "Signup error:",
            result.error
        );

        alert(
            "Sign Up failed:\n\n" +
            result.error.message
        );

        return;
    }

    console.log(
        "Signup successful:",
        result.data
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
    function(event, session) {

        console.log(
            "Auth state:",
            event
        );

        const logoutButton =
            document.getElementById("logout-button");


        // CUSTOMER LOGGED IN
        if (session) {

            console.log(
                "Customer logged in:",
                session.user.email
            );

            console.log(
                "Email verified:",
                !!session.user.email_confirmed_at
            );


            // Show logout button
            if (logoutButton) {

                logoutButton.style.display =
                    "inline-block";

            }

        }

        // CUSTOMER LOGGED OUT
        else {

            console.log(
                "Customer is not logged in."
            );


            // Hide logout button
            if (logoutButton) {

                logoutButton.style.display =
                    "none";

            }

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
        loadProductsFromSupabase();

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
    const account = await checkCustomerAccount();

    if (!account.loggedIn) {
        alert("Please login first.");
        openAuthPopup();
        return;
    }

    const section = document.getElementById("customer-profile-section");

    if (section) {
        section.style.display = "block";
    }

    console.log("Customer profile opened:", account.customer.email);
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
// WISHLIST
// =====================================================

let wishlist = [];

const savedWishlist = localStorage.getItem("heyRosellaWishlist");

if (savedWishlist) {
    try {
        wishlist = JSON.parse(savedWishlist);
    } catch {
        wishlist = [];
    }
}

function saveWishlist() {
    localStorage.setItem("heyRosellaWishlist", JSON.stringify(wishlist));
}

function addToWishlist(productName, productPrice, productImage = "") {
    if (wishlist.some(p => p.name === productName)) {
        alert("Already in wishlist.");
        return;
    }

    wishlist.push({
        name: productName,
        price: productPrice,
        image: productImage
    });

    saveWishlist();

    alert("Added to wishlist!");

    // Update wishlist button
    const wishlistButtons =
        document.querySelectorAll(".wishlist-button");

    wishlistButtons.forEach(button => {
        if (button.dataset.productName === productName) {
            button.textContent = "❤️ Added to Wishlist";
            button.classList.add("added");
        }
    });
}
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


async function openCustomerProfile() {

    const result =
        await supabaseClient.auth.getSession();

    const session =
        result.data.session;

    if (!session) {

        alert("Please login to view your account.");

        openAuthPopup();

        return;
    }

    // Hide all account forms when opening account
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

        popup.style.display = "flex";
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


// tomar existing code
// ...
// ...
// existing last function


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


    if (error) {

        console.error(
            "Account session error:",
            error
        );

        return;
    }


    // CUSTOMER ALREADY LOGGED IN

    if (data.session) {

        window.location.href =
            "my-account.html";

        return;
    }


    // CUSTOMER NOT LOGGED IN

    openAuthPopup();

}


function toggleWishlist(productName, productPrice, button) {

    let wishlist =
        JSON.parse(
            localStorage.getItem("heyRosellaWishlist")
        ) || [];

    const existingProduct =
        wishlist.find(
            item => item.name === productName
        );

    if (existingProduct) {

        // REMOVE FROM WISHLIST

        wishlist =
            wishlist.filter(
                item => item.name !== productName
            );

        localStorage.setItem(
            "heyRosellaWishlist",
            JSON.stringify(wishlist)
        );

        // Change button back to normal
        if (button) {
            button.textContent = "♡ Add to Wishlist";
            button.classList.remove("added");
        }

        alert("💔 Removed from Wishlist");

    } else {

        // ADD TO WISHLIST

        wishlist.push({
            name: productName,
            price: productPrice
        });

        localStorage.setItem(
            "heyRosellaWishlist",
            JSON.stringify(wishlist)
        );

        // Change button to dark/added state
        if (button) {
            button.textContent = "❤️ Added to Wishlist";
            button.classList.add("added");
        }

        alert("❤️ Added to Wishlist");
    }
}

// =====================================================
// LOAD WISHLIST
// =====================================================

function loadWishlist() {

    const wishlistContainer =
        document.getElementById("wishlist-items");

    const emptyWishlist =
        document.getElementById("empty-wishlist");


    if (!wishlistContainer) {
        return;
    }


    let wishlist =
        JSON.parse(
            localStorage.getItem("heyRosellaWishlist")
        ) || [];


    wishlistContainer.innerHTML = "";


    if (wishlist.length === 0) {

        if (emptyWishlist) {
            emptyWishlist.style.display = "block";
        }

        return;
    }


    if (emptyWishlist) {
        emptyWishlist.style.display = "none";
    }


    wishlist.forEach(function(product) {

        const item =
            document.createElement("div");

        item.className =
            "wishlist-item";


        item.innerHTML = `

            <div class="wishlist-image">
                Jewellery Image
            </div>

            <h3>
                ${product.name}
            </h3>

            <p class="wishlist-price">
                ${product.price} BDT
            </p>

        `;
           // ADD TO CART BUTTON
         
         const cartButton =
    document.createElement("button");

cartButton.className =
    "wishlist-cart-button";

cartButton.textContent =
    "🛒 Add to Cart";

cartButton.addEventListener(
    "click",
    function() {

        // Add product to cart
        addToCart(
            product.name,
            product.price,
            product.image || ""
        );

        // Remove product from wishlist
        removeFromWishlist(
            product.name
        );

    }
);

item.appendChild(cartButton);
         
             // REMOVE BUTTON

        const removeButton =
            document.createElement("button");

        removeButton.className =
            "remove-button";

        removeButton.textContent =
            "💔 Remove";


        removeButton.addEventListener(
            "click",
            function() {

                removeFromWishlist(
                    product.name
                );

            }
        );


        item.appendChild(removeButton);


        wishlistContainer.appendChild(item);

    });

}


// =====================================================
// REMOVE FROM WISHLIST
// =====================================================

function removeFromWishlist(productName) {

    let wishlist =
        JSON.parse(
            localStorage.getItem("heyRosellaWishlist")
        ) || [];


    wishlist =
        wishlist.filter(
            item => item.name !== productName
        );


    localStorage.setItem(
        "heyRosellaWishlist",
        JSON.stringify(wishlist)
    );


    loadWishlist();

}

// =====================================================
// LOAD WISHLIST PAGE
// =====================================================

window.addEventListener(
    "DOMContentLoaded",
    function() {

        if (
            document.getElementById(
                "wishlist-items"
            )
        ) {

            loadWishlist();

        }

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
// LOAD PRODUCTS FROM SUPABASE
// =====================================================

async function loadProductsFromSupabase() {

    const productContainer =
        document.getElementById("products-container");

    if (!productContainer) {
        console.log("Products container not found.");
        return;
    }

    console.log("Loading products from Supabase...");

    const { data, error } =
        await supabaseClient
            .from("products")
            .select("*")
            .eq("is_active", true)
            .order("created_at", {
                ascending: false
            });

    if (error) {

        console.error(
            "Product loading error:",
            error
        );

        productContainer.innerHTML = `
            <p style="text-align:center;">
                Unable to load products.
            </p>
        `;

        return;
    }

    console.log(
        "Products loaded:",
        data
    );

    if (!data || data.length === 0) {

        productContainer.innerHTML = `
            <p style="text-align:center;">
                No products available.
            </p>
        `;

        return;
    }

    productContainer.innerHTML = "";

    data.forEach(function(product) {

        const card =
            document.createElement("div");

        card.className = "product-card";

        const imageHTML =
            product.image_url
                ? `
                    <img
                        src="${product.image_url}"
                        alt="${product.name}"
                        loading="lazy"
                    >
                  `
                : `
                    <div class="product-image">
                        Jewellery Image
                    </div>
                  `;

        card.innerHTML = `

            <div class="product-image">

                ${imageHTML}

            </div>

            <h3>
                ${product.name}
            </h3>

            <p>
                ${Number(product.price).toLocaleString("en-BD")} BDT
            </p>

            <button
    onclick="addToCart('${product.name.replace(/'/g, "\\'")}', ${Number(product.price)}, this)"
>
    Add to Cart
</button>
<button
    onclick="toggleWishlist('${product.name.replace(/'/g, "\\'")}', ${Number(product.price)}, this)"
    class="wishlist-button"
>
    ♡ Add to Wishlist
</button>

        `;

        productContainer.appendChild(card);

    });

}