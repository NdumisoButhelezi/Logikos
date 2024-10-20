async function buyNow(productName, price) {
  try {
    if (webMonetization.isMonetized) {
      const response = await axios.post('/api/open-payments-purchase', {
        productName,
        price
      });
      if (response.data.success) {
        alert(`Thank you for purchasing the ${productName} using Open Payments!`);
      } else {
        throw new Error('Open Payments purchase failed');
      }
    } else {
      const response = await axios.post('/api/credit-card-payment', {
        productName,
        price
      });
      if (response.data.success) {
        alert(`Thank you for purchasing the ${productName} using a credit card!`);
      } else {
        throw new Error('Credit card payment failed');
      }
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    alert('There was an error processing your payment. Please try again.');
  }
}

// Get user's location
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    document.getElementById("location").innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  document.getElementById("location").innerHTML = `Your current location: ${latitude}, ${longitude}`;
}

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      document.getElementById("location").innerHTML = "User denied the request for Geolocation."
      break;
    case error.POSITION_UNAVAILABLE:
      document.getElementById("location").innerHTML = "Location information is unavailable."
      break;
    case error.TIMEOUT:
      document.getElementById("location").innerHTML = "The request to get user location timed out."
      break;
    case error.UNKNOWN_ERROR:
      document.getElementById("location").innerHTML = "An unknown error occurred."
      break;
  }
}

// Call getLocation when the page loads
window.onload = getLocation;
