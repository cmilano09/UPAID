document.addEventListener('DOMContentLoaded', function () {
  var generatedID = document.getElementById('generatedID');
  var resetButton = document.getElementById('resetButton');

  function generateAndDisplayID() {
    chrome.runtime.sendMessage({ type: 'getGeneratedID' }, function (response) {
      if (response && response.id) {
        generatedID.innerText = response.id;
      } else {
        generatedID.innerText = 'ID not available';
      }
    });
  }

  generateAndDisplayID();

  resetButton.addEventListener('click', function () {
    chrome.runtime.sendMessage({ type: 'resetGeneratedID' }, function (response) {
      if (response && response.success) {
        generateAndDisplayID();
      } else {
        generatedID.innerText = 'Reset failed';
      }
    });
  });

  // Handle click event for ribbon tabs
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  function activateTab(target) {
    // Remove active class from all tabs and tab contents
    tabs.forEach(function (tab) {
      tab.classList.remove('active');
    });

    tabContents.forEach(function (content) {
      content.classList.remove('active');
    });

    // Add active class to the clicked tab and corresponding content
    const clickedTab = document.querySelector(`[data-target="${target}"]`);
    clickedTab.classList.add('active');
    const clickedTabContent = document.getElementById(target);
    clickedTabContent.classList.add('active');
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', (event) => {
      event.preventDefault(); // Prevents the default link behavior
      const target = tab.getAttribute('data-target');
      activateTab(target);
    });
  });

  // Account Settings Tab
  const accountFields = document.querySelector('#account_settings .account-fields');
  const editButton = document.querySelector('#edit_button');
  const saveButton = document.querySelector('#save_button');

  let isEditing = false;

  // Fetch and populate account fields with data from JSON
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      populateFields(data);
    });

  // Function to populate account fields
  function populateFields(data) {
    document.getElementById('username').value = data.username;
    document.getElementById('email').value = data.email;
    document.getElementById('authenticated').checked = data.authenticated;
    document.getElementById('password').value = data.password;
    document.getElementById('pin').value = data.pin;
    document.getElementById('currency').value = data.currency;
  }

  // Function to toggle the editable state of account fields
  function toggleFieldsEditable(editable) {
    const fields = accountFields.querySelectorAll('input, select');
    fields.forEach(field => {
      field.disabled = !editable;
    });
  }

  // Drag and drop functionality for category buttons
  const categoryButtons = document.querySelectorAll('.category-button');
  const seeSection = document.querySelector('.see-section');
  const avoidSection = document.querySelector('.avoid-section');

  let draggedCategory = null;

  categoryButtons.forEach(button => {
    button.addEventListener('dragstart', dragStart);
  });

  seeSection.addEventListener('dragover', dragOver);
  seeSection.addEventListener('drop', dropToSee);

  avoidSection.addEventListener('dragover', dragOver);
  avoidSection.addEventListener('drop', dropToAvoid);

  function dragStart(event) {
    draggedCategory = event.target;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', event.target.textContent);
  }

  function dragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  function dropToSee(event) {
    event.preventDefault();
    const category = event.dataTransfer.getData('text/plain');
    if (draggedCategory.parentNode === avoidSection) {
      draggedCategory.parentNode.removeChild(draggedCategory);
      const index = Array.from(seeSection.children).indexOf(event.target);
      seeSection.insertBefore(draggedCategory, seeSection.children[index]);
    }
    draggedCategory = null;
  }

  function dropToAvoid(event) {
    event.preventDefault();
    const category = event.dataTransfer.getData('text/plain');
    if (draggedCategory.parentNode === seeSection) {
      draggedCategory.parentNode.removeChild(draggedCategory);
      const index = Array.from(avoidSection.children).indexOf(event.target);
      avoidSection.insertBefore(draggedCategory, avoidSection.children[index]);
    }
    draggedCategory = null;
  }

  // Handle edit button click event
  editButton.addEventListener('click', () => {
    if (!isEditing) {
      toggleFieldsEditable(true);
      editButton.style.display = 'none';
      saveButton.style.display = 'block';
      isEditing = true;
    }
  });

  // Handle save button click event
  saveButton.addEventListener('click', () => {
    if (isEditing) {
      const updatedData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        authenticated: document.getElementById('authenticated').checked,
        password: document.getElementById('password').value,
        pin: document.getElementById('pin').value,
        currency: document.getElementById('currency').value
      };

      // Perform the saving action here
      // For this example, we will just log the updated data
      console.log(updatedData);

      toggleFieldsEditable(false);
      editButton.style.display = 'block';
      saveButton.style.display = 'none';
      isEditing = false;
    }
  });
});

const walletId = 'd95d0c423b104976b36cc76a3db6b5b7';
const adminKey = 'a4e9b40e1e77458eb74770154631f687';

function fetchBalance() {
    fetch(`https://lnbits.com/wallets/${walletId}/balance`, {
        headers: {
            'X-Api-Key': adminKey,
        },
    })
    .then(response => response.json())
    .then(data => {
        // Update the balance in the UI
        let balanceElement = document.getElementById('balance');
        balanceElement.textContent = 'Balance: $' + (data.balance / 100000000).toFixed(2); // Convert satoshis to bitcoins
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Call fetchBalance when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', fetchBalance);