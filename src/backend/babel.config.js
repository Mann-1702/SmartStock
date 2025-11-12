// babel.config.js
module.exports = {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: 'current', // ensures compatibility with your current Node.js version
          },
        },
      ],
    ],
  };
  