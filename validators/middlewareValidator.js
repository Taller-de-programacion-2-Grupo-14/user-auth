let Ajv = require('ajv');
let ajv = new Ajv({ allErrors:true, removeAdditional:'all' });
const draft6MetaSchema = require('ajv/dist/refs/json-schema-draft-06.json');
ajv.addMetaSchema(draft6MetaSchema);
let userSchema = require('./new-user.json');
let loginSchema = require('./login-user.json');
let profileSchema = require('./profile-user.json');
let changePasswordSchema =  require('./update-password.json');
ajv.addSchema(userSchema, 'new-user');
ajv.addSchema(loginSchema, 'login-user');
ajv.addSchema(profileSchema, 'profile-user');
ajv.addSchema(changePasswordSchema, 'change-password');

/**
 * Format error responses
 * @param  {Object} schemaErrors - array of json-schema errors, describing each validation failure
 * @return {{errors: *, status: string}} formatted api response
 */
function errorResponse(schemaErrors) {
    let errors = schemaErrors.map((error) => {
        return {
            field: error.instancePath.replace('/', ''),
            message: error.message
        };
    });
    return {
        status: 'failed',
        errors: errors
    };
}

/**
 * Validates incoming request bodies against the given schema,
 * providing an error response when validation fails
 * @param  {String} schemaName - name of the schema to validate
 * @return {Object} response
 */
let validateSchema = (schemaName) => {
    return (req, res, next) => {
        let valid = ajv.validate(schemaName, req.body);
        if (!valid) {
            res.status(400);
            return res.send(errorResponse(ajv.errors));
        }
        next();
    };
};
module.exports = {validateSchema};
