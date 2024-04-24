function addInput() {
    var container = document.getElementById("input-container");

    // Create product ID input
    var productIdInput = document.createElement("input");
    productIdInput.type = "text";
    productIdInput.name = "product_id[]";
    productIdInput.placeholder = "Product ID";

    // Create amount input
    var amountInput = document.createElement("input");
    amountInput.type = "number";
    amountInput.name = "amount[]";
    amountInput.placeholder = "Amount";

    // Append inputs to the container
    container.appendChild(productIdInput);
    container.appendChild(amountInput);
    container.appendChild(document.createElement("br")); 
    console.log("add input")// Add line break
}
function removeInput() {
    var container = document.getElementById("input-container");
    var inputs = container.getElementsByTagName("input");
    
    // Check if there are any input elements
    if (inputs.length >=2) {
        var lastInputIndex=inputs.length - 1
        var lastInput = inputs[lastInputIndex];
        var secondInput=inputs[lastInputIndex-1]
        var previousSibling = secondInput.previousElementSibling;
        
        // Remove the last input element and its preceding sibling (line break)
        container.removeChild(lastInput);
        container.removeChild(secondInput)
        container.removeChild(previousSibling);
        // if (previousSibling && previousSibling.tagName === "BR") {
        // container.removeChild(previousSibling);
        // }
    }
}
function handleSubmit(event) {
    event.preventDefault(); // Prevent form submission

    var form = event.target;
    var productIds = form.elements["product_id[]"];
    var amounts = form.elements["amount[]"];
    var details=[]
    var detailsHTML=[]
    var totals=0
    // Process the values of the dynamic inputs
    for (var i = 0; i < productIds.length; i++) {
        if(productIds[i].value!=''&& amounts[i].value!=''){
            totals+=parseInt(amounts[i].value)
            var item = {
                product_id: productIds[i].value,
                amount: amounts[i].value,
            };
            details.push(item);
            detailsHTML.push(JSON.stringify(item))
        }
    }
    console.log("Carts:", details);
    // Display the result on the HTML page
    var resultContainer = document.getElementById("result-container");
    // Clear previous result
    resultContainer.innerHTML = "";
    var detailInput_html=document.getElementById('details')
    detailInput_html.value=detailsHTML
    
    console.log(typeof(detailInput_html))
    details.forEach(function(detail) {
        var detailElement = document.createElement("p");
        var detailText = document.createTextNode("Product ID: " + detail.product_id + ", Amount: " + detail.amount);
        
        detailElement.appendChild(detailText);
        resultContainer.appendChild(detailElement)
    });
    console.log("Total:")
    console.log(totals)
    var detailElement1 = document.createElement("p");
    var totalText=document.createTextNode("Total: "+totals)
    detailElement1.appendChild(totalText)

    var totalHTML=document.getElementById('total')
    totalHTML.value=totals
    // resultContainer.appendChild(detailElement);
    resultContainer.appendChild(detailElement1);
     // Reset the form or perform other actions
    //form.reset();
    // var str=`[`+`{"product_id":"AAA","amount":"3"},{"product_id":"VVV","amount":"6"}`+']'
    // var jsonObject = JSON.parse(str);
    // console.log(jsonObject);
}
