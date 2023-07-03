fetch('/api/users', {
    method: "POST",
    body: JSON.stringify({username: "BOber", age: 100, hobbies: ['micro']}),
});
