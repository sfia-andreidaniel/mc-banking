export const errorFormatter = (errorOrErrors: any): any => {
    if (Array.isArray(errorOrErrors)) {
        return {
            "error": true,
            "type": "ValidationError",
            "reasons": errorOrErrors
        };
    } else {
        return {
            "error": true,
            "type": "Runtime error",
            "reasons": [
                {
                    message: String(errorOrErrors).replace(/^Error: /g, ''),
                }
            ]
        };
    }
};
