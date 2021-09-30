# Demo for Keycloak Authorization Services Integration in ASP.NET Core and Angular.

## Start

Use

```bash
docker-compose up
```

to start Keycloak, the API and Angular Frontend.

## Urls

| System   | Url                   |
| -------- | --------------------- |
| Keycloak | http://localhost:8080 |
| API      | http://localhost:5000 |
| Frontend | http://localhost:4200 |

## Logins

| Username | Password | Description                                                                 |
| -------- | -------- | --------------------------------------------------------------------------- |
| admin    | admin    | Keycloak admin user                                                         |
| alice    | alice    | Sales person (Can edit & delete customer. Can create projects)              |
| bob      | bob      | Projectmanager (Can delete projects. Can archive projects where he is lead) |

## Point of interest

### API

| File                                                                                          | Description                                    |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| [startup.cs](src/api/Startup.cs#L77-L131)                                                     | Configures ASP.NET Core authorization policies |
| [DecisionRequirementHandler.cs](src/api/Authorization/Decision/DecisionRequirementHandler.cs) | Handles decision requirements                  |
| [RptRequirementHandler](src/api/Authorization/RPT/RptRequirementHandler.cs)                   | Handles RPT requirements                       |

### Frontend

| File                                                                         | Description                                                                              |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [keycloak.service.ts](src/frontend/src/app/services/keycloak.service.ts#L64) | getEntitlement requests a RPT from Keycloak.                                             |
| [keycloak.service.ts](src/frontend/src/app/services/keycloak.service.ts#L70) | loadPermission loads all permissions from Keycloak to make them available in the client. |
| [backend.interceptor.ts](src/frontend/src/app/backend.interceptor.ts)        | interceptor that uses either RPT or normal Access Token depending on the URL             |
