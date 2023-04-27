import AccessControl from "accesscontrol";
import ApiError from "../model/ApiError.js";
import { factory } from "./debug.js";
/* c8 ignore start */ // only used by users.js which is depricated
const debug = factory(import.meta.url);

/*
 --------------------------
 Access Control List (ACL)
 --------------------------
 /users
 GET       Admin can read any user account.
           User can only read their own account.
 POST      Only admin can create users.
           User shall not create users.
 PUT       Admin can update any user account.
           User can only update their own account.
 DELETE    Admin can delete any user account.
           User can only update their own account.
 */

const grants = [
  // ----- USER -----
  {
    role: "user",
    resource: "/users",
    action: "create:own",
    attributes: "*",
  },
  {
    role: "user",
    resource: "/users",
    action: "read:own",
    attributes: "*",
  },
  {
    role: "user",
    resource: "/users",
    action: "update:own",
    attributes: "*",
  },
  {
    role: "user",
    resource: "/users",
    action: "delete:own",
    attributes: "*",
  },
  // ----- ADMIN -----
  {
    role: "admin",
    resource: "/users",
    action: "create:any",
    attributes: "*",
  },
  {
    role: "admin",
    resource: "/users",
    action: "read:any",
    attributes: "*",
  },
  {
    role: "admin",
    resource: "/users",
    action: "update:any",
    attributes: "*",
  },
  {
    role: "admin",
    resource: "/users",
    action: "delete:any",
    attributes: "*",
  },
];

const accessControl = new AccessControl(grants);

const httpVerb2actionVerb = (httpVerb) => {
  switch (httpVerb) {
    case "OPTIONS":
    case "GET":
      return "read";
    case "POST":
      return "create";
    case "PUT":
    case "PATCH":
      return "update";
    case "DELETE":
      return "delete";
    default:
      throw new Error("Invalid action");
  }
};

const actionMapper = (verb) => {
  switch (verb) {
    case "create":
      return { any: "createAny", own: "createOwn" };
    case "update":
      return { any: "updateAny", own: "updateOwn" };
    case "read":
      return { any: "readAny", own: "readOwn" };
    case "delete":
      return { any: "deleteAny", own: "deleteOwn" };
    default:
      throw new Error("invalid action");
  }
};

/**
 * This function check permissions against the ACL.
 * If permission is granted, it will attach a `permission` object to the `req` object and return.
 * If permission is not granted, it will throw an error.
 *
 * Note: The reason this function is not made a middleware is that `req` object does not have
 * all the properties (such as params)when it is passed through a middleware.
 * On the other hand, you have a complete `req` in the route handler.
 *
 * @param <Object> req the Request object built into Express.
 * @param method the HTTP verb (i.e., GET, POST, PUT, DELETE)
 * @param resource the resource (entity)
 * @param role the role of the user making the request
 * @param user the ID of the user making the request
 * @param owner the ID of the owner of the resource
 */
const checkPermission = (req, { method, resource, role, user, owner }) => {
  const verb = httpVerb2actionVerb(method);
  const action = actionMapper(verb);
  debug(
    `RESOURCE: ${resource}, ACTION: ${verb}, ROLE: ${role}, USER: ${user}, OWNER: ${owner}`
  );
  let permission = accessControl.can(role.toLowerCase());

  if (permission[action.any](resource).granted) {
    debug(
      "this user can perform this action on any instance of this resource."
    );
    req.permission = permission[action.any](resource);
    return;
  }

  // Perhaps this user have permission to its own instance of this resource?
  if (permission[action.own](resource).granted) {
    // let's make sure this instance of the resource belongs to this user
    if (user && owner && user === owner) {
      debug(
        "This resource belongs to this user and the user is permitted to perform this action."
      );
      req.permission = permission[action.own](resource);
      return;
    }
  }

  debug("User is not authorized to perform this action on this resource.");
  throw new ApiError(
    403,
    `As a ${role.toUpperCase()}, you are not authorized to perform ${verb.toUpperCase()} action on ${resource} resource.`
  );
};

export default checkPermission;
/* c8 ignore end */