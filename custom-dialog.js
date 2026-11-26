/* Hey Rosella branded dialogs and notifications */
(function () {
    "use strict";

    const styles = `
        .hr-dialog-backdrop {
            position: fixed; inset: 0; z-index: 100000;
            display: flex; align-items: center; justify-content: center;
            padding: 20px; background: rgba(34, 22, 19, .58);
            backdrop-filter: blur(3px);
        }
        .hr-dialog {
            width: min(100%, 430px); background: #fffaf7; color: #38221e;
            border: 1px solid #f0d9d0; border-radius: 18px; padding: 26px;
            box-shadow: 0 18px 55px rgba(28, 15, 12, .25);
            font-family: Arial, Helvetica, sans-serif;
            animation: hrDialogIn .18s ease-out;
        }
        @keyframes hrDialogIn {
            from { opacity: 0; transform: translateY(8px) scale(.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .hr-dialog-mark {
            width: 42px; height: 42px; display: grid; place-items: center;
            border-radius: 50%; background: #fff0c2; color: #8a6810;
            font-size: 21px; margin-bottom: 14px;
        }
        .hr-dialog h2 { margin: 0 0 10px; font-size: 20px; color: #38221e; }
        .hr-dialog-message {
            margin: 0; color: #66534d; font-size: 15px; line-height: 1.6;
            white-space: pre-wrap; overflow-wrap: anywhere;
        }
        .hr-dialog-input {
            display: block; width: 100%; box-sizing: border-box; margin-top: 16px;
            padding: 12px 13px; border: 1px solid #d9c4bb; border-radius: 9px;
            background: white; color: #38221e; font-size: 15px; outline: none;
        }
        .hr-dialog-input:focus { border-color: #c49a27; box-shadow: 0 0 0 3px rgba(212,175,55,.16); }
        .hr-dialog-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
        .hr-dialog-btn {
            border: 0; border-radius: 9px; padding: 11px 18px; cursor: pointer;
            font-size: 14px; font-weight: 700; min-width: 88px;
        }
        .hr-dialog-cancel { background: #f1e8e4; color: #5b453e; }
        .hr-dialog-primary { background: #d4af37; color: white; }
        .hr-dialog-primary:hover { background: #b99120; }
        .hr-dialog-cancel:hover { background: #e8d9d2; }
        .hr-toast-stack {
            position: fixed; top: 20px; right: 20px; z-index: 100001;
            display: flex; flex-direction: column; gap: 10px;
            width: min( calc(100vw - 40px), 370px); pointer-events: none;
        }
        .hr-toast {
            background: #3e2723; color: #fff; border-left: 4px solid #d4af37;
            border-radius: 10px; padding: 14px 16px; line-height: 1.5;
            font: 14px Arial, Helvetica, sans-serif; white-space: pre-wrap;
            overflow-wrap: anywhere; box-shadow: 0 8px 24px rgba(0,0,0,.2);
            animation: hrDialogIn .18s ease-out;
        }
        @media (max-width: 480px) {
            .hr-dialog { padding: 22px; }
            .hr-toast-stack { top: 12px; right: 12px; width: calc(100vw - 24px); }
        }
    `;

    function ensureStyles() {
        if (document.getElementById("hr-dialog-styles")) return;
        const style = document.createElement("style");
        style.id = "hr-dialog-styles";
        style.textContent = styles;
        (document.head || document.documentElement).appendChild(style);
    }

    function dialog(message, options) {
        ensureStyles();
        const settings = options || {};
        return new Promise(resolve => {
            const backdrop = document.createElement("div");
            backdrop.className = "hr-dialog-backdrop";
            backdrop.setAttribute("role", "presentation");

            const panel = document.createElement("section");
            panel.className = "hr-dialog";
            panel.setAttribute("role", settings.input ? "dialog" : "alertdialog");
            panel.setAttribute("aria-modal", "true");

            const mark = document.createElement("div");
            mark.className = "hr-dialog-mark";
            mark.textContent = settings.icon || (settings.input ? "✎" : settings.confirm ? "?" : "♥");

            const heading = document.createElement("h2");
            heading.textContent = settings.title || (settings.confirm ? "Please confirm" : settings.input ? "Enter a value" : "Hey Rosella");

            const body = document.createElement("p");
            body.className = "hr-dialog-message";
            body.textContent = String(message ?? "");

            panel.append(mark, heading, body);

            let input;
            if (settings.input) {
                input = document.createElement("input");
                input.className = "hr-dialog-input";
                input.type = settings.inputType || "text";
                input.value = settings.defaultValue || "";
                input.placeholder = settings.placeholder || "";
                panel.appendChild(input);
            }

            const actions = document.createElement("div");
            actions.className = "hr-dialog-actions";

            function finish(value) {
                backdrop.remove();
                resolve(value);
            }

            if (settings.confirm || settings.input) {
                const cancel = document.createElement("button");
                cancel.type = "button";
                cancel.className = "hr-dialog-btn hr-dialog-cancel";
                cancel.textContent = "Cancel";
                cancel.addEventListener("click", () => finish(settings.input ? null : false));
                actions.appendChild(cancel);
            }

            const primary = document.createElement("button");
            primary.type = "button";
            primary.className = "hr-dialog-btn hr-dialog-primary";
            primary.textContent = settings.confirm || settings.input ? (settings.primaryText || "Continue") : "OK";
            primary.addEventListener("click", () => finish(settings.input ? input.value : settings.confirm ? true : undefined));
            actions.appendChild(primary);
            panel.appendChild(actions);
            backdrop.appendChild(panel);
            document.body.appendChild(backdrop);

            backdrop.addEventListener("click", event => {
                if (event.target === backdrop && (settings.confirm || settings.input)) {
                    finish(settings.input ? null : false);
                }
            });
            panel.addEventListener("keydown", event => {
                if (event.key === "Escape" && (settings.confirm || settings.input)) {
                    finish(settings.input ? null : false);
                } else if (event.key === "Enter") {
                    event.preventDefault();
                    primary.click();
                }
            });
            primary.focus();
            if (input) input.focus();
        });
    }

    window.showConfirmDialog = function (message, options) {
        return dialog(message, { ...(options || {}), confirm: true });
    };

    window.showPromptDialog = function (message, defaultValue, options) {
        return dialog(message, { ...(options || {}), input: true, defaultValue: defaultValue || "" });
    };

    window.alert = function (message) {
        ensureStyles();
        let stack = document.querySelector(".hr-toast-stack");
        if (!stack) {
            stack = document.createElement("div");
            stack.className = "hr-toast-stack";
            document.body.appendChild(stack);
        }
        const toast = document.createElement("div");
        toast.className = "hr-toast";
        toast.setAttribute("role", "status");
        toast.textContent = String(message ?? "");
        stack.appendChild(toast);
        window.setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transition = "opacity .2s ease";
            window.setTimeout(() => {
                toast.remove();
                if (!stack.children.length) stack.remove();
            }, 220);
        }, 3800);
    };
})();