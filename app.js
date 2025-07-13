const display = document.querySelector(".display");
const buttons = document.querySelectorAll(".button");

let currentInput = ""; 
let resultDisplayed = false; 

buttons.forEach(button => {
    button.addEventListener("click", () => {  
        const value = button.textContent; 

        if (button.classList.contains("number") || button.classList.contains("operator")) {
            if (resultDisplayed) {
                if (button.classList.contains("number")) {
                    // Start new input if number pressed after '='
                    currentInput = value;
                } else if (button.classList.contains("operator")) {
                    // Continue from result if operator pressed
                    currentInput = currentInput + value;
                }
                resultDisplayed = false;
            } else {
                currentInput += value;
            }
            display.textContent = currentInput;
            
        } else if (value === "C") {
            currentInput = "";
            display.textContent = "0";
        } else if (value === "DEL") {
            currentInput = currentInput.slice(0, -1);
            display.textContent = currentInput || "0";
        } else if (value === "=") {
            const result = calculateExpression(currentInput);
            display.textContent = result;
            currentInput = result.toString();
            resultDisplayed = true;
        }
    });
});

const calculateExpression = (currentInput) => {
    try {
        const tokens = tokenize(currentInput); // Tokenize the input string
        const postfix = infixToPostfix(tokens); // Convert infix to postfix notation
        const result = evaluatePostfix(postfix); // Evaluate the postfix expression
        return result; // Return the final result
    }catch (error) {
        console.error("Error in calculation:", error);
        return "Error"; // Return error message if calculation fails
    }   
};

const tokenize = (currentInput) => {
    const tokens = [];
    let num = "";

    for(let i = 0; i < currentInput.length; i++) {
        const ch = currentInput[i];

        if("0123456789.".includes(ch)) {
            num += ch; // Build the number string
        }else if(ch === "-" && (i === 0 || "()+-*/".includes(currentInput[i - 1]))) {
            num += ch; // Handle negative numbers
        }else if ("+-*/%()".includes(ch)) {
            if (num !== "") {
            tokens.push(num);
            num = "";
            }
            tokens.push(ch); // Push the operator to the tokens
        }
    }
    if (num !== "") {
        tokens.push(num); // Push the last number if exists
    }
    return tokens; // Return the array of tokens
};

const infixToPostfix = (tokens) => {
    const output = [];
    const operators = [];
    const precedence = {
        "+": 1,
        "-": 1,
        "*": 2,
        "/": 2,
        "%": 2
    };

    tokens.forEach(tokens => {
        if(!isNaN(tokens)) {
            output.push(tokens); // If token is a number, push to output
        }else if(tokens === "(") {
            operators.push(tokens); // If token is '(', push to operators   
        }else if(tokens === ")") {
            while(operators.length && operators[operators.length - 1] !== "(") {
                output.push(operators.pop()); // Pop operators until '(' is found
            }
            operators.pop(); // Remove the '(' from the stack
        }else {
            while (
                operators.length &&
                precedence[operators[operators.length - 1]] >= precedence[tokens]
            ) {
                output.push(operators.pop()); // Pop operators based on precedence
            }
            operators.push(tokens); // Push the current operator to the stack
        }
    });
    while(operators.length) {
        output.push(operators.pop()); // Pop all remaining operators to output
    }
    return output; // Return the postfix expression
};

const evaluatePostfix = (postfix) => {
    const stack = [];
    postfix.forEach(token => {
        if(!isNaN(token)) {
            stack.push(parseFloat(token)); // If token is a number, push to stack
        }else {
            const b = stack.pop(); // Pop the top two elements for operation
            const a = stack.pop();
            let result;
            switch(token) {
                case "+":
                    result = a + b; break;
                case "-":
                    result = a - b; break;
                case "*":
                    result = a * b; break;
                case "/":
                    result = a / b; break;
                case "%":
                    result = a % b; break;
                default:
                    throw new Error("Unknown operator: " + token);
            }
            stack.push(result); // Push the result back to the stack
        }
    });

    return stack[0]; // The final result will be the only element left in the stack

};

document.addEventListener("keydown", function (e) {
    const key = e.key; // Get the pressed key
    
    if ("0123456789.+-*/%()".includes(key)) {
        if (resultDisplayed && "0123456789".includes(key)) {
            currentInput = key; // start fresh if number pressed after '='
            resultDisplayed = false;
        } else if (resultDisplayed && "+-*/%".includes(key)) {
            currentInput += key; // continue from result if operator pressed
            resultDisplayed = false;
        } else {
        currentInput += key;
        }
        display.textContent = currentInput;
    }

    if (key === "Enter" || key === "=") {
        e.preventDefault();
        const result = calculateExpression(currentInput);
        display.textContent = result;
        currentInput = result.toString();
        resultDisplayed = true;
    }

    if (key === "Backspace") {
        e.preventDefault();
        currentInput = currentInput.slice(0, -1);
        display.textContent = currentInput || "0";
    }

    if (key === "Escape") {
        e.preventDefault();
        currentInput = "";
        display.textContent = "0";
    }

});