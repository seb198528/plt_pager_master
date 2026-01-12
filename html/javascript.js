let messages = [];
let contacts = [];
let currentMessageIndex = 0;
let selectedContactElement = null;
let currentPagerId = null;
let translations = {};

function _(key) {
  return translations[key] || key;
}

const audioSuccess = new Audio("assets/sounds/pagersound.mp3");
const audioStart = new Audio("assets/sounds/pagersoundone.mp3");
const audioFail = new Audio("assets/sounds/pagersoundfailed.mp3");

$(function () {
  const messageDisplay = $("#messageDisplay");
  const messageCounter = $("#messageCounter");
  const contactsList = $("#contactsList");
  const pager = $("#pager");

  function updateMessageUI() {
    if (!Array.isArray(messages)) {
      messageDisplay.text(_("error_while_loading_message"));
      messageCounter.text("0/0");
      return;
    }

    if (messages.length > 0) {
      const msg = messages[currentMessageIndex];
      if (msg && msg.sender_pager && msg.message) {
        messageDisplay.text(`${_("from")} ${msg.sender_pager} ${msg.message}`);
      } else {
        messageDisplay.text(_("message_error"));
      }
      messageCounter.text(`${currentMessageIndex + 1}/${messages.length}`);
    } else {
      messageDisplay.text(_("no_messages"));
      messageCounter.text("0/0");
    }
  }

  function slideDownAndHide() {
    pager.css("bottom", "-500px");
  }

  function sendNuiMessage(action, data = {}) {
    $.post(
      `https://${GetParentResourceName()}/${action}`,
      JSON.stringify(data),
      {
        headers: { "Content-Type": "application/json; charset=UTF-8" },
      }
    );
  }

  contactsList.on("click", "div", function () {
    if (selectedContactElement) {
      selectedContactElement.removeClass("selected-contact");
    }
    selectedContactElement = $(this);
    selectedContactElement.addClass("selected-contact");
  });

  $("#nextMessage").on("click", function () {
    if (messages.length > 0 && currentMessageIndex < messages.length - 1) {
      currentMessageIndex++;
      updateMessageUI();
    }
  });

  $("#prevMessage").on("click", function () {
    if (messages.length > 0 && currentMessageIndex > 0) {
      currentMessageIndex--;
      updateMessageUI();
    }
  });

  $("#toggleScreen").on("click", function () {
    let messageScreen = document.getElementById("messageDisplay");
    let sendScreen = document.getElementById("sendScreen");
    let screen3 = document.getElementById("contactScreen");
    let counter = document.getElementById("messageCounter");

    if (messageScreen.style.display !== "none") {
      messageScreen.style.display = "none";
      sendScreen.style.display = "block";
      screen3.style.display = "none";
      counter.style.display = "none";
    } else if (sendScreen.style.display !== "none") {
      sendScreen.style.display = "none";
      screen3.style.display = "block";
      messageScreen.style.display = "none";
      counter.style.display = "none";
    } else {
      screen3.style.display = "none";
      messageScreen.style.display = "block";
      sendScreen.style.display = "none";
      counter.style.display = "block";
    }
  });

  $("#toggleScreen2").on("click", function () {
    let messageScreen = document.getElementById("messageDisplay");
    let sendScreen = document.getElementById("sendScreen");
    let screen3 = document.getElementById("contactScreen");
    let counter = document.getElementById("messageCounter");

    if (messageScreen.style.display !== "none") {
      messageScreen.style.display = "none";
      screen3.style.display = "block";
      sendScreen.style.display = "none";
      counter.style.display = "none";
    } else if (screen3.style.display !== "none") {
      screen3.style.display = "none";
      sendScreen.style.display = "block";
      messageScreen.style.display = "none";
      counter.style.display = "none";
    } else {
      sendScreen.style.display = "none";
      messageScreen.style.display = "block";
      screen3.style.display = "none";
      counter.style.display = "block";
    }
  });

  $("#sendButton").on("click", function () {
    const targetPagerId = $("#targetPagerId").val();
    const message = $("#messageInput").val();
    if (targetPagerId && message) {
      sendNuiMessage("sendMessage", { targetPagerId, message });
    }
  });

  $("#closeButton").on("click", function () {
    sendNuiMessage("closePager");
  });

  $("#saveContactButton").on("click", function () {
    $("#saveContactButton").hide();
    $("#saveContactName, #saveContactNumber").show();
    contactsList.hide();
    audioStart.play();
  });

  $("#saveContactButton2").on("click", function () {
    const saveContactNamevalue = $("#saveContactName").val();
    const saveContactNumbervalue = $("#saveContactNumber").val();

    if (!saveContactNamevalue || !saveContactNumbervalue) return;

    sendNuiMessage("saveContact", {
      saveContactNamevalue,
      saveContactNumbervalue,
    });

    const newContactDiv = $("<div>")
      .text(`${saveContactNumbervalue} - ${saveContactNamevalue}`)
      .data("contactId", saveContactNumbervalue);
    contactsList.append(newContactDiv);

    $("#saveContactName, #saveContactNumber").val("").hide();
    $("#saveContactButton, #contactsList").show();
    audioSuccess.play();
  });

  $("#deleteContactButton").on("click", function () {
    if (!selectedContactElement) return;

    const contactIdToDelete = selectedContactElement.data("contactId");
    sendNuiMessage("deleteContact", { contactId: contactIdToDelete });

    selectedContactElement.remove();
    selectedContactElement = null;
    audioSuccess.play();
  });

  $(window).on("message", function (event) {
    const data = event.originalEvent.data;
    if (!data || !data.action) return;

    switch (data.action) {
      case "register":
        currentPagerId = data.pagerId;
        $("#pagerIdDisplay").text("ID: " + data.pagerId);
        messages =
          data.messages && Array.isArray(data.messages) ? data.messages : [];
        contacts =
          data.contacts && Array.isArray(data.contacts) ? data.contacts : [];

        contactsList.empty();
        selectedContactElement = null;
        contacts.forEach((contact) => {
          const div = $("<div>")
            .text(`${contact.pager_saved} - ${contact.pager_saved_name}`)
            .data("contactId", contact.pager_saved);
          contactsList.append(div);
        });

        currentMessageIndex = 0;
        updateMessageUI();
        break;

      case "togglePager":
        if (data.translations) {
          translations = data.translations;
          $("#saveContactButton").text(_("save_contact"));
          $("#saveContactNumber").attr("placeholder", _("recipient_id"));
          $("#saveContactName").attr("placeholder", _("contact_name"));
          $("#targetPagerId").attr("placeholder", _("recipient_id"));
          $("#messageInput").attr("placeholder", _("your_message"));
          messageDisplay.text(_("no_messages"));
          updateMessageUI();
        }
        if (data.state) {
          pager.show();
          setTimeout(() => pager.css("bottom", "-200px"), 10);
        } else {
          slideDownAndHide();
        }
        break;

      case "receive":
        messageDisplay.text(
          `${_("from")}: ${data.fromPagerId}\n${data.message}`
        );
        break;

      case "hide":
        slideDownAndHide();
        break;

      case "PagersendMessage":
      case "PagersendFailed":
        const messageInput = $("#messageInput");
        const randomTime =
          Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
        const stepTime = randomTime / 6;

        messageInput.prop("disabled", true).val(_("sending_message"));
        audioStart.play();

        setTimeout(() => messageInput.val(_("sending_message2")), stepTime);
        setTimeout(() => messageInput.val(_("sending_message3")), stepTime * 2);
        setTimeout(() => messageInput.val(_("sending_message")), stepTime * 3);
        setTimeout(() => messageInput.val(_("sending_message2")), stepTime * 4);
        setTimeout(() => messageInput.val(_("sending_message3")), stepTime * 5);

        setTimeout(() => {
          if (data.action === "PagersendMessage") {
            messageInput.val(_("message_sent"));
            audioSuccess.play();
          } else {
            messageInput.val(_("message_failed"));
            audioFail.play();
          }
        }, randomTime - 500);

        setTimeout(
          () => messageInput.prop("disabled", false).val(""),
          randomTime + 2000
        );
        break;
    }
  });
});
