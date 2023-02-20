import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatcontainer = document.querySelector('#chat_container');

let loadinterval;

function loader(element) {
  element.textContent = '';

  loadinterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

function typetext(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateuniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalstring = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalstring}`;
}

function chatstripe(isAi, value, uniqueId) {
  return `
    <div class="wrapper ${isAi ? 'ai' : ''}">
      <div class="chat">
        <div class="profile">
          <img src="${isAi ? 'public/bot.jpg' : 'public/user.jpg'}" 
              alt="${isAi ? 'bot' : 'user'}" />
        </div>
        <div class="message" id="${uniqueId}">${value}</div>
      </div>
    </div>
  `;
}

const handlesubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // user chatstripe
  chatcontainer.innerHTML += chatstripe(false, data.get('prompt'));

  form.reset();

  // bot chatstripe
  const uniqueId = generateuniqueId();
  chatcontainer.innerHTML += chatstripe(true, ' ', uniqueId);

  chatcontainer.scrollTop = chatcontainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv)

  const response = await fetch(server_backend, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  });

  clearInterval(loadinterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();
    typetext(messageDiv, parsedData);
  } else {
    const status = response.status;
    const error = await response.text();
    console.error(`Error ${status}: ${error}`);
    messageDiv.innerHTML = "Something went wrong";
    alert(`Error ${status}: ${error}`);
  }
}

form.addEventListener('submit', handlesubmit);

form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handlesubmit(e);
  }
});
