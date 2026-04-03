async function loadStats() {
    try {
      const response = await fetch("/api/stats");
      const data = await response.json();
  
      document.getElementById("totalProducts").textContent = data.totalProducts;
      document.getElementById("instanceId").textContent = data.instanceId;
      document.getElementById("timestamp").textContent = data.timestamp;
      document.getElementById("cacheStatus").textContent =
        response.headers.get("X-Cache-Status") || "N/A";
    } catch (error) {
      document.getElementById("totalProducts").textContent = "Error";
      document.getElementById("instanceId").textContent = error.message;
      document.getElementById("timestamp").textContent = "-";
      document.getElementById("cacheStatus").textContent = "-";
    }
  }
  
  document.getElementById("loadStatsBtn").addEventListener("click", loadStats);
  loadStats();