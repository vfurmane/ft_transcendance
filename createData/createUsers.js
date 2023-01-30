const fetch = require("node-fetch");

var max_id = '';

//not fonctional, you must add the id of max to the currentUser.id in frendship route and in home page


async function createMatch(ids)
{
    for (let j = 0; j < ids.length; j++)
    {
        let others = ids.filter(el => el !== ids[j]);
        for (let i = 0; i < others.length; i++)
        {
            if (others[i] !== ids[j] )
            {
                const num1 = Math.floor(Math.random() * 5);
                const num2 = Math.floor(Math.random() * 5);
                const data = {
                    winner_id: (i % 2 === 0? others[i] : ids[j]),
                    looser_id: (i % 2 === 0? ids[j] : others[i]),
                    score_winner: Math.max(num1, num2),
                    score_looser: Math.min(num1, num2),
                }
                await fetch(`http://localhost:3000/match`, {
                    method: 'POST',
                    headers: {
                        "content-type" : "application/json"
                    },
                    body: JSON.stringify(data)
                })
                .then(res => res.json())
                .then(data => console.log(`createMatch ${data}`))
                .catch(error => {console.log("Il y a eu un problème avec l'opération fetch : " + error.message);});
            }
        }
    }
}


async function addFriends(max_id, ids)
{
    for (let i = 1; i < ids.length; i++)
    {
        await fetch(`http://localhost:3000/friendships/${ids[i]}`, {
        method: "PUT",
        })
        .then((res)=> res.json())
        .then((data => {
            console.log(`addFriend ${data}`);
        }))
        .catch(function (error) {
        console.log(
            "Il y a eu un problème avec l'opération fetch : " + error.message
        );
        });
    }
    
}

async function createUser (){
    let ids = [];
    for (let i = 0; i < 10; i++)
    {
        const data = {
        email: `name${i}@gmail.com`,
        username: (i === 0? 'max': `name ${i}`),
        password: '123'
        }
        await fetch(`http://localhost:3000/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        })
        .then((res)=> res.json())
        .then((data => {
            console.log(data);
            if (i === 0)
                max_id  = data.id;
            ids.push(data.id);
        }))
        .catch(function (error) {
        console.log(
            "Il y a eu un problème avec l'opération fetch : " + error.message
        );
        });
    }

    await new Promise(r => setTimeout(r, 30000));

    addFriends(max_id, ids);
    createMatch(ids);
}

createUser();