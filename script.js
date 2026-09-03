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

async function addToCart(productName, productPrice, button) {

    try {

        // Get latest stock from Supabase
        const { data, error } = await supabaseClient
            .from("products")
            .select("stock_quantity")
            .eq("name", productName)
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

            return product.name === productName;

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
            .eq("name", product.name)
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
