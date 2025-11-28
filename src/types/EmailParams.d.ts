export interface EmailParams {
	email: string;
	subject: string;
	mailgenContent: {
		body: {
			name: string;
			intro: string;
			action: {
				instructions: string;
				button: {
					color: string;
					text: string;
					link: string;
				};
			};
			outro: string;
		};
	};
}
