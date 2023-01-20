let mysql = require("mysql");
let connData = {
 host:"localhost",
 user:"root",
 password:"",
 database:"employeeDB",
};
let connection = mysql.createConnection(connData);

let express = require("express");
let app = express();
app.use(express.json());
app.use(function(req,res,next){
res.header("Access-Control-Allow-Origin","*");
res.header("Access-Control-Allow-Methods",
"GET,POST,OPTIONS,PUT,PATCH,DELETE,HEAD");
res.header("Access-Control-Allow-Headers",
"Origin,X-Requested-With,Content-Type,Accept");
next();
});
var port = process.env.PORT||2410;
app.listen(port,()=>console.log(`Node app listening on port ${port}!`));

makeSearchString=(department="",designation="",gender="")=>{
    let searchStr="";
    searchStr=addToquery(searchStr,"department",department);
    searchStr=addToquery(searchStr,"designation",designation);
    searchStr=addToquery(searchStr,"gender",gender);
    return searchStr;
    }
addToquery=(str,paraNam,paraVal)=>
    paraVal?str?str+" AND "+paraNam+"=?":paraNam+"=?":str;

makeStr=(department="",designation="",gender="",sortBy="")=>{
    let searchStr="";
    searchStr=addTo(searchStr,department);
    searchStr=addTo(searchStr,designation);
    searchStr=addTo(searchStr,gender);
    searchStr=addTo(searchStr,sortBy);
    return searchStr;
    }
addTo=(str,pval)=>
pval?str?str+","+pval:pval:str;

app.get("/emps",function(req,res){
let sql="SELECT * FROM employees";
let department=req.query.department;
let designation=req.query.designation;
let sortBy=req.query.sortBy;
let gender=req.query.gender;
let str="";
let st=makeStr(department,designation,gender,sortBy);
    if(department||designation||gender){
     if(sortBy){
            sql="SELECT * FROM employees WHERE "+makeSearchString(department,designation,gender)+" ORDER BY "+sortBy+" ASC";
            str=st.split(",");      
        }else{
          sql="SELECT * FROM employees WHERE "+makeSearchString(department,designation,gender)+"";
          str=st.split(","); 
        }
    }else if(sortBy){
        sql="SELECT * FROM employees ORDER BY "+sortBy+"";
        str=sortBy;
    }

   if(str){
    connection.query(sql,str,function(er1,result1){
        if(er1) res.status(404).send(er1);
        else res.send(result1);
    })
   }else{
    connection.query(sql,function(er1,result1){
        if(er1) res.status(404).send(er1);
        else res.send(result1);
    })
   } 
});

app.get("/emps/:empCode",function(req,res){
    let empCode = +req.params.empCode;
    let sql = "SELECT * FROM employees WHERE empCode=?";
    connection.query(sql,empCode,function(err,result){
        if(err) res.status(404).send(err);
        else res.send(result);
    })   
})

app.post("/emps",function(req,res){
 let body = req.body;
 let arr = [body.empCode,body.name,body.department,body.designation,body.salary,body.gender];
 let sql = "INSERT INTO employees(empCode,name,department,designation,salary,gender) VALUES(?,?,?,?,?,?)";
 connection.query(sql,arr,function(err,results){
    if(err) res.status(404).send(err);
    else{
    let sql1 = "SELECT * FROM employees WHERE empCode=?";
    connection.query(sql1,body.empCode,function(err1,result){
        if(err1) res.status(404).send(err1);
        else res.send(result);
    })    
    }
 })
});
app.put("/emps/:empCode",function(req,res){
    let empCode = +req.params.empCode;
    let body = req.body;
    let arr=[body.name,body.department,body.designation,body.salary,body.gender,empCode]
    let sql = "UPDATE employees SET name=?,department=?,designation=?,salary=?,gender=? WHERE empCode=?";
    connection.query(sql,arr,function(err,results){
        if(err) res.status(404).send(err);
        else{
            let sql1 = "SELECT * FROM employees WHERE empCode=?";
            connection.query(sql1,empCode,function(err1,result){
                if(err1) res.status(404).send(err1);
                else res.send(result);
             })
        } 
    })
})
app.delete("/emps/:empCode",function(req,res){
    let empCode = +req.params.empCode;
    let sql = "DELETE FROM employees WHERE empCode=?";
    connection.query(sql,empCode,function(err,result){
        if(err) res.status(404).send(err);
        else res.send("Deleted Successfully");
    })
})