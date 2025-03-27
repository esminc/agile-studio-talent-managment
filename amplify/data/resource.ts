import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { postConfirmation } from "../auth/post-confirmation/resource";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" records.
=========================================================================*/
const schema = a
  .schema({
    Todo: a
      .model({
        content: a.string(),
      })
      .authorization((allow) => [allow.guest()]),

    Account: a
      .model({
        name: a.string().required(),
        email: a.email().required(),
        photo: a.string(), // URL to photo
        organizationLine: a.string().required(),
        residence: a.string().required(),
        assignments: a.hasMany("ProjectAssignment", "accountId"),
        owner: a.string(),
      })
      .secondaryIndexes((index) => [index("email")])
      .authorization((allow) => [
        allow.authenticated().to(["read"]),
        allow.owner().to(["create", "update", "delete"]),
        allow.group("Admin").to(["create", "update", "delete"]),
      ]),

    Project: a
      .model({
        name: a.string().required(),
        clientName: a.string().required(),
        overview: a.string().required(),
        startDate: a.date().required(),
        endDate: a.date(),
        assignments: a.hasMany("ProjectAssignment", "projectId"),
        technologies: a.hasMany("ProjectTechnologyLink", "projectId"),
      })
      .authorization((allow) => [
        allow.authenticated().to(["read"]),
        allow.group("Admin").to(["create", "update", "delete"]),
      ]),

    ProjectTechnology: a
      .model({
        name: a.string().required(),
        description: a.string(),
        projects: a.hasMany("ProjectTechnologyLink", "technologyId"),
      })
      .authorization((allow) => [allow.authenticated()]),

    ProjectAssignment: a
      .model({
        projectId: a.id().required(),
        accountId: a.id().required(),
        startDate: a.date().required(),
        endDate: a.date(),
        project: a.belongsTo("Project", "projectId"),
        account: a.belongsTo("Account", "accountId"),
      })
      .authorization((allow) => [
        allow.authenticated().to(["read"]),
        allow.group("Admin").to(["create", "update", "delete"]),
      ]),

    ProjectTechnologyLink: a
      .model({
        projectId: a.id().required(),
        technologyId: a.id().required(),
        project: a.belongsTo("Project", "projectId"),
        technology: a.belongsTo("ProjectTechnology", "technologyId"),
      })
      .authorization((allow) => [allow.authenticated()]),
  })
  .authorization((allow) => [allow.resource(postConfirmation)]);

export type Schema = ClientSchema<typeof schema>;

// Export types for frontend use
export type Account = Schema["Account"];
export type Project = Schema["Project"];
export type ProjectTechnology = Schema["ProjectTechnology"];
export type ProjectAssignment = Schema["ProjectAssignment"];
export type ProjectTechnologyLink = Schema["ProjectTechnologyLink"];

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
