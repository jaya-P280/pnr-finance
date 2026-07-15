import branchService from "./branch.service.js";
import ApiResponse from "../../shared/ApiResponse.js";

class BranchController {

    async createBranch(req, res, next) {

        try {

            const result = await branchService.createBranch(
                req.body,
                req.user
            );

            return res.status(201).json(
                new ApiResponse(
                    201,
                    result,
                    "Branch created successfully."
                )
            );

        } catch (error) {

            next(error);

        }

    }

    async getBranches(req, res, next) {

        try {

            const result =
                await branchService.getBranches(req.query);

            return res.status(200).json(

                new ApiResponse(

                    200,

                    result,

                    "Branches fetched successfully."

                )

            );

        }

        catch (error) {

            next(error);

        }

    }

    async getBranchById(req, res, next) {

        try {

            const result =
                await branchService.getBranchById(

                    Number(req.params.id)

                );

            return res.status(200).json(

                new ApiResponse(

                    200,

                    result,

                    "Branch fetched successfully."

                )

            );

        }

        catch (error) {

            next(error);

        }

    }

    async updateBranch(req, res, next) {

        try {

            await branchService.updateBranch(

                Number(req.params.id),

                req.body,

                req.user

            );

            return res.status(200).json(

                new ApiResponse(

                    200,

                    null,

                    "Branch updated successfully."

                )

            );

        }
        catch (error) {

            next(error);

        }

    }


    async updateBranchStatus(req, res, next) {

        try {

            await branchService.updateBranchStatus(

                Number(req.params.id),

                req.body.status,

                req.user

            );

            return res.status(200).json(

                new ApiResponse(

                    200,

                    null,

                    "Branch status updated successfully."

                )

            );

        } catch (error) {

            next(error);

        }

    }

    async deleteBranch(req, res, next) {

        try {

            await branchService.deleteBranch(

                Number(req.params.id),

                req.user

            );

            return res.status(200).json(

                new ApiResponse(

                    200,

                    null,

                    "Branch deleted successfully."

                )

            );

        } catch (error) {

            next(error);

        }

    }
}

export default new BranchController();