var requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };
  
  fetch("https://backend.pluralcode.institute/course-list", requestOptions)
    .then(response => response.text())
    .then(result => {
      // Update an HTML element with the result
      document.getElementById('result-container').textContent = result;
    })
    .catch(error => console.log('error', error));
  