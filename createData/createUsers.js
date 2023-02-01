const fetch = require("node-fetch");

var access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZDFlOGExMi00ODMxLTQwNGUtYTBhZi1lYTMxYTRhZDNmMTgiLCJuYW1lIjoibWF4IiwianRpIjoiYTlkYzE4NzgtMzljOC00OTNlLWIxOGMtZDA2OGMyMDRmYzcyIiwiaWF0IjoxNjc1MjU1NzU4LCJleHAiOjE2NzUyNTYwNTh9.LrGjxjVC_1-7DfsZ--Bgzs-DjTuJO61-BnQyRFk5wKY"

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
                await fetch(`http://localhost:8080/api/match`, {
                    method: 'POST',
                    headers: {
                        "content-type" : "application/json",
                        'Authorization': 'Bearer ' + access_token,
                    },
                    body: JSON.stringify(data)
                })
                .then(() => console.log(`createMatch ok`))
                .catch(error => {console.log("Il y a eu un problème avec l'opération fetch : " + error.message);});
            }
        }
    }
}

async function addFriends(ids)
{
    for (let i = 0; i < ids.length; i++)
    {
        await fetch(`http://localhost:8080/api/friendships/${ids[i]}`, {
        method: "PUT",
        headers: {
            'Authorization': 'Bearer ' + access_token,
        }
        })
        .then((res)=> res.json())
        .then((data => {
            console.log(`addFriend ${JSON.stringify(data)}`);
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
        username: `name ${i}`,
        password: '123'
        }
        await fetch(`http://localhost:8080/api/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        })
        .then((res)=> res.json())
        .then((data => {
            console.log(data);
            ids.push(data.id);
        }))
        .catch(function (error) {
        console.log(
            "Il y a eu un problème avec l'opération fetch : " + error.message
        );
        });
    }
    addFriends(ids);
    createMatch(ids);
}

createUser();