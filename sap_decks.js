var base_url = "https://staging.teamwood.games/0.18/api/";
var version = 18;

var login_url = base_url+"user/login";
var all_decks_url = base_url+"deck/all";
var add_or_update_url = base_url+"deck/add-or-update";
var delete_url = base_url+"deck/delete"

var token = "";

function report_error(error)
{
    var error_box = document.getElementById("error_box");
    error_box.innerText = error;
}

function add_deck()
{
    let new_deck_code = document.getElementById("new_deck_code");
    try{
        let deck = JSON.parse(new_deck_code.value);
        deck.Id = "00000000-0000-0000-0000-000000000000";

        let payload = {"Id": null, "Model": deck};

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if(this.status == 0) return;
            if(this.status != 200)
            {
                if(this.response) report_error(JSON.parse(this.response).title);
                else              report_error(this.status+" Error");
            }
            else
            {
                refresh_list();
            }
        };
        xhttp.open("POST", add_or_update_url, true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("Authorization", "Bearer "+token);
        xhttp.send(JSON.stringify(payload));
    }
    catch(error)
    {
        report_error(error);
    }
}

function refresh_list()
{
    var deck_list = document.getElementById("deck_list");
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.status == 200 && this.response)
        {
            let response = JSON.parse(this.response);
            deck_list.innerHTML = "";

            let refresh_button = document.createElement("button");
            refresh_button.innerText = "Refresh";
            refresh_button.onclick = refresh_list;
            deck_list.appendChild(refresh_button);

            let table = document.createElement("table");
            table.style="width:95em; table-layout:fixed;";
            deck_list.appendChild(table);

            let row = document.createElement("tr");
            table.appendChild(row);
            row.innerHTML = "<th style='width:5em;'></th><th style='width:18em'>Deck ID</th><th style='width:5em;'>Name</th><th style='width:2em;'>Icon</th><th style='width:30em;'>Pets</th><th style='width:23em;'>Foods</th><th style='width:5em;'></th>";
            for(let i = 0; i < response.length; i++)
            {
                let row = document.createElement("tr")
                let deck = response[i];

                {
                    let copy_button_element = document.createElement("td");

                    let copy_button_button = document.createElement("button");
                    copy_button_button.innerText = "Copy to Clipboard";
                    let deck_no_id = JSON.parse(JSON.stringify(deck));
                    delete deck_no_id.Id;
                    let copy_deck = function() {
                        navigator.clipboard.writeText(JSON.stringify(deck_no_id));
                    }
                    copy_button_button.onclick = copy_deck;
                    copy_button_element.appendChild(copy_button_button);
                    row.appendChild(copy_button_element);
                }

                let id_element = document.createElement("td");
                id_element.style="word-wrap: break-word;";
                id_element.innerText = deck.Id;
                row.appendChild(id_element);

                let name_element = document.createElement("td");
                name_element.style="word-wrap: break-word;";
                name_element.innerText = deck.Title;
                row.appendChild(name_element);

                let icon_element = document.createElement("td");
                icon_element.innerText = deck.Minion;
                row.appendChild(icon_element);

                let pets_element = document.createElement("td");
                pets_element.style="word-wrap: break-word;";
                pets_element.innerText = deck.Minions;
                row.appendChild(pets_element);

                let foods_element = document.createElement("td");
                foods_element.style="word-wrap: break-word;";
                foods_element.innerText = deck.Spells;
                row.appendChild(foods_element);

                {
                    let delete_button_element = document.createElement("td");

                    let delete_deck = function()
                    {
                        let xhttp = new XMLHttpRequest();
                        xhttp.onreadystatechange = function() {
                            refresh_list();
                        };
                        xhttp.open("POST", delete_url, true);
                        xhttp.setRequestHeader("Content-type", "application/json");
                        xhttp.setRequestHeader("Authorization", "Bearer "+token);
                        xhttp.send(JSON.stringify({"Id":deck.Id}));
                    }

                    let delete_button_button = document.createElement("button");
                    delete_button_button.innerText = "Delete";
                    delete_button_button.onclick = delete_deck;
                    delete_button_element.appendChild(delete_button_button);
                    row.appendChild(delete_button_element);
                }

                table.appendChild(row);
            }

            {
                let new_deck_element = document.createElement("div");
                new_deck_element.id = "new_deck_line";

                let label_element = document.createElement("label");
                label_element.for = "new_deck_code";
                label_element.innerText = "Deck Code:";
                new_deck_element.appendChild(label_element);

                let input_element = document.createElement("input");
                input_element.type = "text";
                input_element.name = "new_deck_code";
                input_element.id = "new_deck_code";
                new_deck_element.appendChild(input_element);

                let add_button = document.createElement("button");
                add_button.innerText = "Add Deck";
                add_button.onclick = add_deck;
                new_deck_element.appendChild(add_button);

                deck_list.appendChild(new_deck_element);
            }
            report_error("");
        }
        else
        {
            if(this.response) report_error(response.title);
            else              report_error(this.status+" Error");
        }
    };
    xhttp.open("GET", all_decks_url, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.setRequestHeader("Authorization", "Bearer "+token);
    xhttp.send();
    deck_list.innerHTML = "";
}

function login()
{
    let email_box = document.getElementById("email");
    let password_box = document.getElementById("password");
    let email = email_box.value;
    let password = password_box.value;

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        let status_element = document.getElementById("deck_list");
        if(this.status == 200 && this.response)
        {
            let response = JSON.parse(this.response);
            token = response.Token;
            refresh_list();
        }
        else
        {
            if(this.response)
            {
                let response = JSON.parse(this.response);
                report_error(response.title);
            }
        }
    };
    xhttp.open("POST", login_url, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    let login_details = {"Email":email, "Password":password, "Version":version}
    xhttp.send(JSON.stringify(login_details));
}
