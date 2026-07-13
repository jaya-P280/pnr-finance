import emailService from "../email.service.js";
import passwordSetupTemplate from "./password-setup.template.js";

await emailService.sendEmail({
    to:"jayaprakashgoudpalem80@gmail.com",
    subject:"testing",
    html:passwordSetupTemplate({
        name:"Jaya Prakash",
        setupLink:"http://localhost:5000/"
    })
})

console.log("Done")