const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const axios = require('axios')
var cors = require("cors");
app.use(express.json())

app.use(cors());
app.post('/api/user', async (req, res) => {

    const API_KEY = "AADIywXVen_ihhJ1KmIEyQMF4O0atL5Nh6zrNseUi03lXl0T";

    
    const requestOptions = {
        headers: { 
            Authorization: `Bearer ${API_KEY}`
        },
    }

    const res2 = await axios.get(req.body.user, requestOptions) //user profile
    const res3 = await axios.get(req.body.sub, requestOptions) //user subumissions



    var profile = (res2.data.data);
    var submissions = (res3.data);
    var cnt = 0

    profile.object.contestData = [];

    
    for(let i=0;i<profile.object.contests.length;i++){
        var curContest = profile.object.contests[i];
        var obj = {
            performance : 0,
            ratingOld: "",
            rating: "",
            ratingChange: 0,
            contest: "",
            place: "",
            percentile: 0,
            date: "",
            name: "",
            link: "",
        }

        if(curContest.performance !== null){
            cnt++;
            obj.performance = curContest.performance.toFixed(0)
            obj.rating = curContest.rating
            obj.contest = curContest.key

            const res4 = await axios.get(`https://dmoj.ca/api/v2/contest/${curContest.key}`, requestOptions)
            var contestDetails = res4.data.data.object
            
            obj.date = contestDetails.end_time.substring(0,10);
            obj.name = contestDetails.name;

            var arr = contestDetails.rankings.slice()
            

            for(let j = 0; j<arr.length; j++){
                var curUser = arr[j];
                if(curUser.user === profile.object.username){
                    obj.place = j+1
                    obj.ratingOld = curUser.old_rating
                    if(obj.ratingOld===null)obj.ratingOld = 0
                    obj.percentile = 100 - (((j+1)/arr.length)*100).toFixed(0)
                    break;
                }
            }
            obj.link = `/${curContest.key}/ranking/#!${profile.object.username}`
            obj.ratingChange = obj.rating - obj.ratingOld
            profile.object.contestData.push(obj);
        }
    }

    profile.object.contestCount = cnt.toString();
    profile.object.subCount = Object.keys(submissions).length

    res.json(profile)
    


})
app.listen(process.env.PORT || 5000)



const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
