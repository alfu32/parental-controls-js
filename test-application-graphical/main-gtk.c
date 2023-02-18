#include <gtk/gtk.h>

void on_button_clicked(GtkWidget *button, gpointer data) {
    g_print("Hello, World!\n");
}


int main(int argc, char *argv[])
{
    gtk_init(&argc, &argv);

    // Create a window
    GtkWidget *window = gtk_window_new(GTK_WINDOW_TOPLEVEL);
    gtk_window_set_title(GTK_WINDOW(window), "My GTK Application");
    gtk_window_set_default_size(GTK_WINDOW(window), 400, 300);
    gtk_container_set_border_width(GTK_CONTAINER(window), 10);

    GtkWidget *box = gtk_box_new(GTK_ORIENTATION_VERTICAL, 0);
    gtk_container_add(GTK_CONTAINER(window), box);

    // Create a button
    GtkWidget *button = gtk_button_new_with_label("Click me");
    g_signal_connect(button, "clicked", G_CALLBACK(on_button_clicked), NULL);
    gtk_container_add(GTK_CONTAINER(box), button);

    // Create a label
    GtkWidget *label = gtk_label_new("Enter your name:");
    gtk_container_add(GTK_CONTAINER(box), label);

    // Create an entry
    GtkWidget *entry = gtk_entry_new();
    gtk_container_add(GTK_CONTAINER(box), entry);

    // Create a check button
    GtkWidget *check_button = gtk_check_button_new_with_label("Enable feature");
    gtk_container_add(GTK_CONTAINER(box), check_button);

    // Create radio buttons
    GtkWidget *radio_button1 = gtk_radio_button_new_with_label(NULL, "Option 1");
    GtkWidget *radio_button2 = gtk_radio_button_new_with_label_from_widget(GTK_RADIO_BUTTON(radio_button1), "Option 2");
    GtkWidget *radio_button3 = gtk_radio_button_new_with_label_from_widget(GTK_RADIO_BUTTON(radio_button2), "Option 3");

    // Create a combo box
    GtkWidget *combo_box = gtk_combo_box_text_new();
    gtk_combo_box_text_append_text(GTK_COMBO_BOX_TEXT(combo_box), "Option 1");
    gtk_combo_box_text_append_text(GTK_COMBO_BOX_TEXT(combo_box), "Option 2");
    gtk_combo_box_text_append_text(GTK_COMBO_BOX_TEXT(combo_box), "Option 3");
    gtk_container_add(GTK_CONTAINER(box), combo_box);

    // Create a list box
    GtkWidget *list_box = gtk_list_box_new();
    GtkWidget *list_item1 = gtk_list_box_row_new();
    GtkWidget *list_item2 = gtk_list_box_row_new();
    GtkWidget *list_item3 = gtk_list_box_row_new();
    GtkWidget *list_item1_label = gtk_label_new("List item 1");
    GtkWidget *list_item2_label = gtk_label_new("List item 2");
    GtkWidget *list_item3_label = gtk_label_new("List item 3");
    gtk_container_add(GTK_CONTAINER(list_item1), list_item1_label);
    gtk_container_add(GTK_CONTAINER(list_item2), list_item2_label);
    gtk_container_add(GTK_CONTAINER(list_item3), list_item3_label);
    gtk_container_add(GTK_CONTAINER(list_box), list_item1);
    gtk_container_add(GTK_CONTAINER(list_box), list_item2);
    gtk_container_add(GTK_CONTAINER(list_box), list_item3);
    gtk_container_add(GTK_CONTAINER(box), list_box);

    // Show the widgets and run the main loop
    gtk_widget_show_all(window);
    gtk_main();

    return 0;
}
