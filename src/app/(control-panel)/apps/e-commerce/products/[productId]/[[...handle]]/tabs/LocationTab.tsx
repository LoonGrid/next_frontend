import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { Controller, useFormContext } from 'react-hook-form';

/**
 * The pricing tab.
 */
function LocationTab() {
	const methods = useFormContext();
	const { control, watch } = methods;
	const locations = watch('business_location')

	return (
		<div>
			<Controller
			   defaultValue={locations.name}
				name="comparedPrice"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						className="mt-8 mb-16"
						label="Location"
						id="comparedPrice"
						
						type="text"
						variant="outlined"
						fullWidth
						helperText="This is default location"
					/>
				)}
			/>
			
		</div>
	);
}

export default LocationTab;
