# LC-SyncInAction

Why take the effort of copy/pasting your solution manually when you can make use of technology to do it for you while you can grind more in Leetcode.

LC-SyncInAction solves this problem and takes your cookie in his hand to pull and push your Accepted solution every day.

First run will pull all your Accepted solutions from LC ( which will take **1h 45 min to 2h 30 min approx** ) and create a file with a extension of those submission in the current repository in the specified directory (root, if not provided ). Currently provide extension support for all languages accepted by leetcode 

Every file created using this tool follows this naming convention : <submission_id>_<title_slug_of_problem>. [SEE THIS EXAMPLE REPO ](https://github.com/ME-ON1/leetcode-bunker/)

All the runs afterward won't take long as the first run ( will be completed in few seconds :) ) and will fetch the last 20 submissions and this step can also be customized according to your preferred timing with the help of [schedule](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#scheduled-events)

### Requirements : 

`cookie` value from the request headers  https://leetcode.com/<your-username> 

This cookie value has to be saved in repository secret named as `cookieVal` which **has to be** passed as `${{ secrets.cookieVal }}` into action step [you can look here on how to do save a repository secret](https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository)

You can also pass location of directory, to option `solution_location` , where would you like to collect all your solutions ( the default is root directory ). 

## Usage

Make a `WORKFLOW` file under `.github` folder by any name of your choice and start writing github actions. 

Example use case of action in your WORKFLOWS.
    
    on: 
        schedule: 
            - cron : '0 8 * * *' # your favourable timing
    
    jobs : 
      build :
        run-on : ubuntu-latest 

      steps : 
        -name : Using LC-Collectinator
         uses : ME-ON1/Leetcode-SyncInAction
            with :
              cookieVal : ${{ secrets.cookieVal }} # secrets.cookieVal coming from repository secret    
              solution_location : 'path/to/directory'  # if any , default is root '.'
          
        # dependency, to write newly created files to the root directory of the repository.  
    
        - name: pushing the changes!!
        uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: Adding new LC solutions # or anything you want to add.

If you need to look at examples check [.github/WORKFLOWS](https://github.com/ME-ON1/Leetcode-SyncInAction/tree/main/.github/WORKFLOWS) to understand a bit more.

## License

The scripts and documentation in this project are released under the [MIT License](https://github.com/ME-ON1/Leetcode-SyncInAction/blob/main/LICENSE)
  
## Issues 

Please file an Issue with brief information about the bug. 
