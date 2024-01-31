document.addEventListener('DOMContentLoaded', function () {
  const btn = document.querySelector('.btn_custom');

  btn.addEventListener('click', function () {
    fetch('https://ipapi.co/json/')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('User IP Address:', data.ip);
        // You can do more with the IP address here, such as sending it to a server
      })
      .catch(error => {
        console.error('Error fetching IP address:', error.message);
      });
  });
});
