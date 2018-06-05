let aws = require('aws-sdk');
let sf = new aws.StepFunctions();
let moment = require('moment');

//
//	This Lambda Function is responsabile for restarting the main AWS Lambda
//
exports.handler = async (event) => {
	
	//
	//	1.	Get the ARN of the Step Function that needs to be restarted
	//
	let step_function_arn = event.step_function_arn;
	
	//
	//	2.	Get the date of today which will become the next date for the 
	//		Step Function execution
	//
	let new_execution_data = moment().format("YYYY-MM-DD");
	
	//
	//	3.	Set default settings when starting the SF we know how much time 
	//		passed since the invocation, and what is the ARN to restart
	//
	let step_function_input_options = {
		step_function_arn: step_function_arn,
		execution_date: new_execution_data
	};
	
	//
	//	4.	Set the option to start a Step Function
	//
	let options = {
		input: step_function_input_options,
		stateMachineArn: step_function_arn
	};
	
	//
	//	->	Start the step function
	//
	sf.startExecution(options, function(error, data) {
	  
		//
		//	1.	Check if there were SDK errors
		//
		if(error)
		{
			throw error;
		}
		
		//
		//	->	Return the default data
		//
		return event;
		
	});
	
};