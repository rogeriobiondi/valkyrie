## Prereqs

- Python 3.11.x
- NodeJs

## Creating dashboard web app

```
npx create-react-app@latest dashboard
npm i apexcharts react-apexcharts
cd dashboard
npm start
```


## Installation

```
# Install backend libraries
poetry install

# Install frontend libraries
cd dashboard
npm install
cd ..
```

## Starting Infra

```
touch .env
make infra-start
```

## Starting API

Next, we'll start the API

```
make api-run
```


## Create your first metric

In the next step, we'll create a sample metric:


```
curl --location 'localhost:8000/measurement' \
--header 'Content-Type: application/json' \
--data '{
    "measurement": "radar",
    "dimensions": [
        { "name": "state", "type": "varchar" },
        { "name": "city", "type": "varchar" },
        { "name": "base", "type": "varchar" },
        { "name": "company", "type": "varchar" },
        { "name": "etapa", "type": "varchar" }
    ],
    "fields": [
        { "name": "loggi_key", "type": "varchar" },
        { "name": "antecipado", "type": "integer" },
        { "name": "no_prazo", "type": "integer" },
        { "name": "atrasado", "type": "integer" }
    ]
}'
```

## Bulk Data Ingestion

Next, we'll ingest data. After ingestion, the data-topic will be created for consuming messages:


```
curl --location 'localhost:8000/bulk' \
--header 'Content-Type: text/plain' \
--data 'radar,state=SP,city=São\ Paulo,base=ST2,company=ali,etapa=01\ separacao\ agencia loggi_key=MQYDOTLG3LOGOI3U6WGFDHQQLB,antecipado=1,no_prazo=0,atrasado=0
radar,state=SP,city=Diadema,base=AGO,company=ali,etapa=02\ transporte loggi_key=MQYDOTLG3LOGOI3U6WGFDHQQLB,antecipado=0,no_prazo=0,atrasado=1
radar,state=SP,city=São\ Paulo,base=ST2,company=amazon,etapa=01\ separacao\ agencia loggi_key=MQYDOTLG3LOGOI3U6WGFDHQQLB,antecipado=1,no_prazo=0,atrasado=0
radar,state=SP,city=São\ Paulo,base=CAJ2,company=magalu,etapa=03\ recebimento\ XD loggi_key=MQYDOTLG3LOGOI3U6WGFDHQQLB,antecipado=0,no_prazo=1,atrasado=0
radar,state=SP,city=São\ Paulo,base=JGO,company=amazon,etapa=03\ recebimento\ XD loggi_key=MQYDOTLG3LOGOI3U6WGFDHQQLB,antecipado=1,no_prazo=0,atrasado=0
radar,state=SP,city=São\ Paulo,base=AGO,company=ali,etapa=03\ recebimento\ XD loggi_key=MQYDOTLG3LOGOI3U6WGFDHQQLB,antecipado=0,no_prazo=0,atrasado=0
radar,state=SP,city=São\ Paulo,base=AGO,company=shopee,etapa=03\ recebimento\ XD loggi_key=MQYDOTLG3LOGOI3U6WGFDHQQLB,antecipado=0,no_prazo=0,atrasado=1'
```

## Start the bulk data loader

The Bulk data loader will process messages loaded via Bulk API or `radar-insights` kafka topic.
To start the Data Loader

```
make loader-run
```

## Create Datasource

After the metric is created and some data loaded into the 

```
curl --location 'localhost:8000/datasource' \
--header 'Content-Type: application/json' \
--data '{
    "name": "radar_datasource",
    "query": {
        "measurement": "radar",
        "fields": [ 
            { "expression": "etapa", "alias": "etapa" },
            { "expression": "sum(antecipado)", "alias": "antecipado" },
            { "expression": "sum(no_prazo)", "alias": "no_prazo" },
            { "expression": "sum(atrasado)", "alias": "atrasado" }
        ],
        "filters": [
            { "field": "company", "op": "eq", "value": "$company" }
        ],
        "group": ["etapa"],
        "order": [ 
            {"field": "etapa", "order": "asc"}
        ],
        "window": "30 days"
    }
}'
```

## Create Datasource

Next, we need to configurate the dashboard:

```
curl --location 'localhost:8000/dashboard' \
--header 'Content-Type: application/json' \
--data '{
    "name": "radar_dashboard",
    "datasource": "radar_datasource",
    "categories": 0,
    "config": {
        "width": 500,
        "height": 400
    }
}
'
```

## Configure the dashboard

- Open the `dashboard/src/App.js` file.
- Add the `radar_dashboard` component:

```
<div className="flex-item">
    <BarChart key={this.state.counter} ref={this.state.ref} width="500" height="400" name="radar_dashboard" filter={this.state.filterCompany} />
</div>
```

## Testing the application

```
make dashboard-start
```

Access the dashboard URL:
http://localhost:3000
