const fetch = require("node-fetch");

var max_id = '';


async function createMatch(ids)
{
    for (let j = 0; j < ids.length; j++)
    {
        let others = ids.filter(el => el !== ids[j]);
        console.log(`others: ${others}`);
        for (let i = 0; i < others.length; i++)
        {
            const data = {
                winner_id: (i % 2 === 0? others[i] : ids[j]),
                looser_id: (i % 2 === 0? ids[j] : others[i]),
                score_winner: Math.floor(Math.random() * 5),
                score_looser: Math.floor(Math.random() * 5),
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
    
    }}
}

async function updateLevel(id)
{
    const data = {
        user_id: id,
        xp: Math.floor(Math.random() * 1000)
    }
    await fetch(`http://localhost:3000/user/updateLevel`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    })
    .then((res)=> res.json())
    .then((data => {
        console.log(`updateLevel ${data}`);
    }))
    .catch(function (error) {
    console.log(
        "Il y a eu un problème avec l'opération fetch : " + error.message
    );
    });
}

async function addFriend(max_id, data_id, i)
{
    const data = {
        initiator_id: (i % 2 === 0? max_id : data_id),
        target_id: (i % 2 === 0? data_id : max_id)
    }
    await fetch(`http://localhost:3000/friendships`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
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

async function createUser (){
    let ids = [];
    for (let i = 0; i < 10; i++)
    {
        const data = {
        email: `{name${i}@gmail.com`,
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
            else
                addFriend(max_id, data.id, i);
            updateLevel(data.id);
            ids.push(data.id);
        }))
        .catch(function (error) {
        console.log(
            "Il y a eu un problème avec l'opération fetch : " + error.message
        );
        });
    }

    createMatch(ids);
}

createUser();