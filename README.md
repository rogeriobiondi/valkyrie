## Prereqs

- Python 3.11.x
- NodeJs


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
curl --location 'localhost:8000/measurements' \
--header 'Content-Type: application/json' \
--data '{
    "name": "radar",
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
radar,state=SP,city=Araraquara,base=ARQ,company=shopee,etapa=02\ transporte loggi_key=MQYDOTLG3LOGOI3U6WGFDHQQLB,antecipado=0,no_prazo=0,atrasado=1
radar,state=SP,city=São\ Paulo,base=ST2,company=amazon,etapa=01\ separacao\ agencia loggi_key=MQYDOTLG3LOGOI3U6WGFDHQQLB,antecipado=1,no_prazo=0,atrasado=0
radar,state=SP,city=São\ Paulo,base=CAJ2,company=magalu,etapa=03\ recebimento\ XD loggi_key=MQYDOTLG3LOGOI3U6WGFDHQQLB,antecipado=0,no_prazo=1,atrasado=0
radar,state=SP,city=São\ Paulo,base=JGO,company=amazon,etapa=03\ recebimento\ XD loggi_key=MQYDOTLG3LOGOI3U6WGFDHQQLB,antecipado=1,no_prazo=0,atrasado=0
radar,state=SP,city=São\ Paulo,base=AGO,company=ali,etapa=03\ recebimento\ XD loggi_key=MQYDOTLG3LOGOI3U6WGFDHQQLB,antecipado=0,no_prazo=0,atrasado=0
radar,state=SP,city=São\ Paulo,base=FCA,company=magalu,etapa=01\ separacao\ agencia loggi_key=MQYDOTLG3LOGOI3U6WGFDHQQLB,antecipado=1,no_prazo=0,atrasado=0
radar,state=SP,city=São\ Paulo,base=FCA,company=magalu,etapa=01\ separacao\ agencia loggi_key=MQYDOTLG3LOGOI3U6WGFDHQQLB,antecipado=0,no_prazo=1,atrasado=0
radar,state=SP,city=São\ Paulo,base=FCA,company=magalu,etapa=01\ separacao\ agencia loggi_key=MQYDOTLG3LOGOI3U6WGFDHQQLB,antecipado=0,no_prazo=0,atrasado=1
'
```

## Start the bulk data loader

The Bulk data loader will process messages loaded via Bulk API or `radar-insights` kafka topic.
To start the Data Loader

```
make loader-run
```

## Create Datasources


```
curl --location 'localhost:8000/datasources' \
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
            { "field": "company", "op": "eq", "value": "$company" },
            { "field": "etapa", "op": "eq", "value": "$etapa" }
        ],
        "group": ["etapa"],
        "order": [ 
            {"field": "etapa", "order": "asc"}
        ],
        "window": "30 days"
    }
}'

curl --location 'localhost:8000/datasources' \
--header 'Content-Type: application/json' \
--data '{
    "name": "etapa_datasource",
    "query": {
        "measurement": "radar",
        "fields": [ 
            { "expression": "base", "alias": "base" },
            { "expression": "sum(case when etapa = '\''01 separacao agencia'\'' then 1 else 0 end)", "alias": "e01_separacao_agencia" },
            { "expression": "sum(case when etapa = '\''02 transporte'\'' then 1 else 0 end)", "alias": "e02_transporte" },
            { "expression": "sum(case when etapa = '\''03 recebimento XD'\'' then 1 else 0 end)", "alias": "e03_recebimento_XD" }
        ],
         "filters": [
            { "field": "company", "op": "eq", "value": "$company" },
            { "field": "etapa", "op": "eq", "value": "$etapa" }
        ],
        "group": ["base"],
        "order": [ 
            {"field": "base", "order": "asc"}
        ],
        "window": "30 days"
    }
}'


curl --location 'localhost:8000/datasources' \
--header 'Content-Type: application/json' \
--data '{
    "name": "company_datasource",
    "query": {
        "measurement": "radar",
        "fields": [ 
            { "expression": "company", "alias": "etapa" },
            { "expression": "sum(antecipado)", "alias": "antecipado" },
            { "expression": "sum(no_prazo)", "alias": "no_prazo" },
            { "expression": "sum(atrasado)", "alias": "atrasado" }
        ],
        "filters": [
            { "field": "company", "op": "eq", "value": "$company" }
        ],
        "group": ["company"],
        "order": [ 
            {"field": "company", "order": "asc"}
        ],
        "window": "30 days"
    }
}'
```

## Create Filters

```
curl --location 'http://localhost:8000/filters' \
--header 'Content-Type: application/json' \
--data '{
    "name": "radar_filter_company",
    "datasource": "radar_datasource",
    "dimension": "company",
    "order": "asc"
}'

curl --location 'http://localhost:8000/filters' \
--header 'Content-Type: application/json' \
--data '{
    "name": "radar_filter_etapa",
    "datasource": "radar_datasource",
    "dimension": "etapa",
    "order": "asc"
}'
```

## Create Charts

```
curl --location 'localhost:8000/charts' \
--header 'Content-Type: application/json' \
--data '{
    "name": "radar_chart",
    "datasource": "radar_datasource",
    "categories": 0,    
    "config": {
        "type": "stackedbar-horizontal",
        "width": 500,
        "height": 400,
        "theme": "light",
        "title": "Situação Pacotes"
    }
}
'
```

```
curl --location 'localhost:8000/charts' \
--header 'Content-Type: application/json' \
--data '{
    "name": "etapa_chart",
    "datasource": "etapa_datasource",
    "categories": 0,
    "config": {
         "type": "stackedbar-horizontal",
        "title": "Número de pacotes por etapa do processo",
        "subtitle": "Visão em cada agência",
        "width": 500,
        "height": 400,
        "theme": "light"
    }
}'
```

```
curl --location 'localhost:8000/charts' \
--header 'Content-Type: application/json' \
--data '{
    "name": "company_chart",
    "datasource": "company_datasource",
    "categories": 0,
    "config": {
        "width": 500,
        "height": 400,
        "title": "Situação por Company"
    }
}
'
```

## Create Datasource

Next, we need to configurate the dashboard:

```
curl --location 'http://localhost:8000/dashboards' \
--header 'Content-Type: application/json' \
--data '{
    "name": "radar_dashboard",
    "config": {
        "title": "Radar Dashboard",
        "filters": [ "radar_filter_company", "radar_filter_etapa" ],
        "charts": [ 
            "radar_chart", 
            "etapa_chart",
            "company_chart" 
        ]
    }
}'
```

## Testing the application

```
make dashboard-start
```

Access the dashboard URL:
http://localhost:3000
