const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const { OptimizationStages } = require("webpack");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
	mode: "development",
	// 生成source map，方便调试代码
	devtool: "inline-source-map",
	entry: "./src/index.js",
	output: {
		filename: "dist.js",
		// 若要使用缓存破坏（浏览器自动缓存），可启用下面的设置
		// filename: "[name].[contenthash].js",
		path: path.resolve(__dirname, "dist")
	},
	resolve: {
		alias: {
			"utils": path.resolve(__dirname, "src/utils/")
		}
	},
	optimization: {
		// 代码压缩settings
		minimize: true,
		minimizer: [new TerserPlugin()],
	},
	// 开发服务器, 提供实时预览功能,JS修改后自动刷新
	devServer: {
		static: "./dist",

	},
	plugins: [
		new HtmlWebpackPlugin({
			title: "My App",
		}),
		new BundleAnalyzerPlugin()
	],
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"]
			},
			{
				test: /\.(jpeg|png|jpg)$/i,
				type: "asset/resource"
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					// 适配旧版本浏览器，转义JS代码
					options: {
						presets: ["@babel/preset-env"]
					}
				}
			}
		]
	}
}