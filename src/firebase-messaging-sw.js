/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAQVD6CuDbRCxxvHOc4mwLRwLMXEaLEkvM',
  authDomain: 'correria-app.firebaseapp.com',
  projectId: 'correria-app',
  storageBucket: 'correria-app.firebasestorage.app',
  messagingSenderId: '764241890900',
  appId: '1:764241890900:web:4970eb9ac0f9022e50e7c1',
});

firebase.messaging();
