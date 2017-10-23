module.exports = {
    "extends": "airbnb-base",
		"env": {
        "mocha" : true
    },
    "rules": {
        "no-console": 0,
        "comma-dangle": ["error", {
            "arrays": "never",
            "objects": "never",
            "imports": "always",
            "exports": "always",
            "functions": "ignore"
        }]    
    }
};