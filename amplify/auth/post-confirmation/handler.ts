import type { PostConfirmationTriggerHandler } from "aws-lambda";
import { type Schema } from "../../data/resource";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/postConfirmation";

const { resourceConfig, libraryOptions } =
  await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: PostConfirmationTriggerHandler = async (event) => {
  console.log("postConfirmation event", event);
  const { data: accounts, errors } =
    await client.models.Account.listAccountByEmail({
      email: event.request.userAttributes.email,
    });
  if (errors) {
    console.error("Error listing accounts", errors);
    return event;
  }
  if (accounts.length > 0) {
    console.log("Account already exists", accounts[0]);
    return event;
  }
  const sub = event.request.userAttributes.sub;
  const userName = event.userName;
  const { data: account, errors: createErrors } =
    await client.models.Account.create({
      email: event.request.userAttributes.email,
      name:
        event.request.userAttributes.name ?? event.request.userAttributes.email,
      organizationLine: "",
      residence: "",
      owner: `${sub}::${userName}`,
    });
  if (createErrors) {
    console.error("Error creating account", createErrors);
  }
  console.log("Created account", account);
  return event;
};
