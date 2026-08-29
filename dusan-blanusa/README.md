# PersonalSite

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Chatbot API

The chatbot endpoints are configured in `src/environments/environment.ts` as `chatbotApiUrl`
and `chatbotWarmupUrl`. The warm-up URL is called on chat intent to wake the free-tier backend.
It must accept JSON `POST` requests with `question` and `chat_history`, return a JSON object
containing a non-empty `answer` string, and allow CORS requests from `https://dusanblanusa.com`
and any local development origin that should be supported.

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
