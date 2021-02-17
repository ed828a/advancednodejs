const query = Person.find({ occupation: /host/ })
  .where("name.last")
  .equals("Ghost")
  .where("age")
  .gt(17)
  .lt(66)
  .where("likes")
  .in(["vaporizing", "talking"])
  .limit(10)
  .sort("-occupation")
  .select("name occupation")

  // Check to see if this query has already been fetched in Redis
  query.exec((err, result) => console.log(result));
  // same as 
  query.then(result => console.log(result))
  // same as 
  const result = await query

  // therefore, we override the exec function:
  query.exec = function() {
    // to check to see if this query has alreadyt been executed and 
    // if it has, it returns the result right away
    const result = client.get('query key')
    if(result){
      return result
    }

    // otherwise, issue the query as normal to MongoDB
    const result = runTheOriginalExecFunction();

    // then save that value in redis
    client.set('query key', result)

    return result;
  };