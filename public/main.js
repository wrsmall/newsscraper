$.getJSON("/", function (data) {
    let articleobj={
      article=data;
    }
    JSON.render("index", { data: articleobj });
});


