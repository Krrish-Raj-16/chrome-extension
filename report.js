document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get('usageData', function(result) {
      const usageData = result.usageData || {};
      console.log(usageData);
      const labels = Object.keys(usageData);
      const data = Object.values(usageData).map(ms => ms / 1000 / 60); // Convert milliseconds to minutes
  
      drawPieChart(labels, data);
    });
  
    function drawPieChart(labels, data) {
      const canvas = document.getElementById('usageChart');
      const ctx = canvas.getContext('2d');

      const style = getComputedStyle(canvas);
      const width = parseInt(style.width);
      const height = parseInt(style.height);
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const colors = generateColors(data.length);
  
      //const width = canvas.width;
      //const height = canvas.height;
      const radius = Math.min(width / 2, height / 2) - 40; // Reduce radius for label space
      const centerX = width / 2;
      const centerY = height / 2;
  
      let total = data.reduce((acc, val) => acc + val, 0);
      let startAngle = 0;
  
      data.forEach((value, index) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        ctx.fillStyle = colors[index];
  
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(
          centerX,
          centerY,
          radius,
          startAngle,
          startAngle + sliceAngle
        );
        ctx.closePath();
        ctx.fill();
  
        // Calculate label position
        const midAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + (radius + 20) * Math.cos(midAngle);
        const labelY = centerY + (radius + 20) * Math.sin(midAngle);
  
        // Draw line from chart to label
        ctx.strokeStyle = colors[index];
        ctx.beginPath();
        ctx.moveTo(centerX + radius * Math.cos(midAngle), centerY + radius * Math.sin(midAngle));
        ctx.lineTo(labelX, labelY);
        ctx.stroke();
  
        // Draw label
        ctx.fillStyle = "#000";
        ctx.font = "16px Arial";
        ctx.textAlign = labelX > centerX ? "left" : "right";
        ctx.fillText(labels[index], labelX, labelY);
  
        startAngle += sliceAngle;
      });
    }
  
    function generateColors(length) {
      const colors = [];
      for (let i = 0; i < length; i++) {
        colors.push(`hsl(${i * (360 / length)}, 100%, 75%)`);
      }
      return colors;
    }
  });
  