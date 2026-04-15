require('@babel/register')({
  presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
  extensions: ['.js', '.jsx', '.ts', '.tsx']
});
// This is too complex to setup due to next.js aliases
