import axios from 'axios';

export async function getData(interval) {
    const url = "http://localhost:8000/graph";
    const response = await axios.post(url, {
            measurement: "loss_rate",
            window: "48 hours",
            time_bucket: "1 hour"
    }); 
    console.log(response.data.data);
    return response.data;
}