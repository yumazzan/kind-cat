module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // CSS Minimizer 완전 제거
      webpackConfig.optimization.minimizer = webpackConfig.optimization.minimizer.filter(
        (plugin) => {
          return plugin.constructor.name !== 'CssMinimizerPlugin';
        }
      );
      return webpackConfig;
    },
  },
};
