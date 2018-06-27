let aws = require('aws-sdk');
let sf = new aws.StepFunctions();
let moment = require('moment');

exports.handler = async (event) => {
	
	//
	//	1.	Create a container that will be passed around the chain.
	//
	let container = {
		//
		//	Any request from a API or Lambda invocation goes here.
		//
		req: event,
		//
		//	Get the date of today which will become the next date for the 
		//	Step Function execution
		//
		new_execution_data: moment().format("YYYY-MM-DD"),
		//
		//	The default response for Lambda.
		//
		res: "Done!"
	};

	//
	//	->	Start the chain.
	//
	try 
	{
		container = await prepare_the_data(container);
		container = await start_step_function(container);
	}
	catch(error)
	{
		//
		//	<>> Put the detail in the logs for easy debugging
		//
		console.log(error);
		
		//
		//  1.  Create a message to send back.
		//
		let message = {
			message: error.message || error
		};

		//
		//  2.  Create the response.
		//
		let response = {
			statusCode: error.status || 500,
			body: JSON.stringify(message, null, 4)
		};

		//
		//  ->  Tell lambda that we finished.
		//
		return response;
	}

	//
	//	->	Return a positive response
	//
	return container.response;
	
};

//	 _____    _____     ____    __  __   _____    _____   ______    _____
//	|  __ \  |  __ \   / __ \  |  \/  | |_   _|  / ____| |  ____|  / ____|
//	| |__) | | |__) | | |  | | | \  / |   | |   | (___   | |__    | (___
//	|  ___/  |  _  /  | |  | | | |\/| |   | |    \___ \  |  __|    \___ \
//	| |      | | \ \  | |__| | | |  | |  _| |_   ____) | | |____   ____) |
//	|_|      |_|  \_\  \____/  |_|  |_| |_____| |_____/  |______| |_____/
//

//
//	Set default settings when starting the SF we know how much time 
//	passed since the invocation, and what is the ARN to restart
//
function prepare_the_data(container)
{
	return new Promise(function(resolve, reject) {
	
		container.step_function_input_options = JSON.stringify({
			step_function_arn: container.req.step_function_arn,
			execution_date: container.new_execution_data,
			loop_limit: container.req.loop_limit,
			loop_count: 0
		});
		
		//
		//	->	Move to the next chain.
		//
		return resolve(container);
		
	});
}

//
//	After we have all that we need we can start the Step Function
//
function start_step_function(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Set the option to start a Step Function
		//
		let options = {
			input: container.step_function_input_options,
			stateMachineArn: container.req.step_function_arn
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
				return reject(error);
			}
			
			//
			//	->	Move to the next chain.
			//
			return resolve(container);
			
		});
		
	});
}