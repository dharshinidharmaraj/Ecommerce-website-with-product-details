(function() {
  console.log("script loaded");

  // Track product views
  const productCards = document.querySelectorAll(".product-info");
  productCards.forEach((card) => {
    const product = card.querySelector("h3").innerText;
    const data = {
      event: "click",
      product: product,
      time: new Date()
    };
    
    fetch("http://localhost:5000/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).catch(error => console.log("FETCH ERROR:", error));
  });

  // Track add to cart
  const buttons = document.querySelectorAll(".product-info button");
  console.log(buttons);

  buttons.forEach((button) => {

    button.addEventListener("click", async () => {

      console.log("button clicked");

      const product =
        button.parentElement.querySelector("h3").innerText;

      const data = {
        event: "add_to_cart",
        product: product,
        time: new Date()
      };

      console.log(data);

      try {

        const response = await fetch(
          "http://localhost:5000/track",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
          }
        );

        const result = await response.text();

        console.log(result);

      } catch(error) {

        console.log("FETCH ERROR:", error);

      }

    });

  });
})();