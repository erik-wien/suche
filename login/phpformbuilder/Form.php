<?php

namespace phpformbuilder;

use phpformbuilder\Validator\Validator;

/**
 * Form Class
 *
 * @version 3.0
 * @author Gilles Migliori - gilles.migliori@gmail.com
 *
 */

class Form
{
    /* general */

    protected $form_ID             = '';
    protected $form_attr           = '';
    protected $action              = '';
    protected $add_get_vars        = true;
    protected static $instances;

    /*  bs3_options, material_options :
    *   wrappers and classes styled with Bootstrap 3 or Material Design
    *   each can be individually updated with $form->setOptions();
    */

    protected $bs3_options = array(
        'formInlineClass'          => 'form-inline',
        'formHorizontalClass'      => 'form-horizontal',
        'formVerticalClass'        => '',
        'elementsWrapper'          => '<div class="form-group"></div>',
        'checkboxWrapper'          => '<div class="checkbox"></div>',
        'helperWrapper'            => '<span class="help-block"></span>',
        'radioWrapper'             => '<div class="radio"></div>',
        'wrapElementsIntoLabels'   => false,
        'wrapCheckboxesIntoLabels' => true,
        'wrapRadiobtnsIntoLabels'  => true,
        'elementsClass'            => 'form-control',
        'wrapperErrorClass'        => 'has-error',
        'elementsErrorClass'       => '',
        'textErrorClass'           => 'text-danger',
        'horizontalLabelClass'     => 'control-label',
        'horizontalLabelCol'       => 'col-sm-4',
        'horizontalOffsetCol'      => 'col-sm-offset-4',
        'horizontalElementCol'     => 'col-sm-8',
        'inlineCheckboxLabelClass' => 'checkbox-inline',
        'inlineRadioLabelClass'    => 'radio-inline',
        'inputGroupAddonClass'     => 'input-group-addon',
        'btnGroupClass'            => 'btn-group',
        'requiredMark'             => '<sup class="text-danger">* </sup>',
        'openDomReady'             => '$(document).ready(function () {',
        'closeDomReady'            => '});'
    );

    protected $material_options = array(
        'formInlineClass'          => 'form-inline',
        'formHorizontalClass'      => 'form-horizontal',
        'formVerticalClass'        => '',
        'elementsWrapper'          => '<div class="input-field row"></div>',
        'checkboxWrapper'          => '<div class="checkbox"></div>',
        'helperWrapper'            => '<span class="help-block"></span>',
        'radioWrapper'             => '<div class="radio"></div>',
        'wrapElementsIntoLabels'   => false,
        'wrapCheckboxesIntoLabels' => false,
        'wrapRadiobtnsIntoLabels'  => false,
        'elementsClass'            => 'form-control',
        'wrapperErrorClass'        => 'has-error',
        'elementsErrorClass'       => '',
        'textErrorClass'           => 'text-danger',
        'horizontalLabelClass'     => '',
        'horizontalLabelCol'       => 'col-sm-4',
        'horizontalOffsetCol'      => 'col-sm-offset-4',
        'horizontalElementCol'     => 'col-sm-8',
        'inlineCheckboxLabelClass' => 'checkbox-inline',
        'inlineRadioLabelClass'    => 'radio-inline',
        'inputGroupAddonClass'     => '',
        'btnGroupClass'            => 'btn-group',
        'requiredMark'             => '<sup class="text-danger">* </sup>',
        'openDomReady'             => '$(document).ready(function () {',
        'closeDomReady'            => '});'
    );

    /* error fields + messages */

    protected $errors   = array();
    protected $error_fields = array();

    /* layout */

    protected $layout; /* horizontal | vertical | inline */

    /* init (no need to change anything here) */

    protected $btn_cancel             = '';
    protected $btn_reset              = '';
    protected $btn_submit             = '';
    protected $checkbox               = array();
    protected $checkbox_end_wrapper   = '';
    protected $checkbox_start_wrapper = '';
    protected $elements_end_wrapper   = '';
    protected $elements_start_wrapper = '';
    protected $end_fieldset           = '';
    protected $form_end_wrapper       = '';
    protected $form_start_wrapper     = '';
    protected $framework              = '';
    protected $group_name             = array();
    protected $has_file               = false;
    protected $hasDependantField      = false;
    protected $has_recaptcha_error    = false;
    protected $helper_end_wrapper     = '';
    protected $helper_start_wrapper   = '';
    protected $hidden_fields          = '';
    protected $html_element_content   = array(); // ex : $this->html_element_content[$element_name][$pos][] = $html
    protected $input_grouped          = array();
    protected $input_wrapper          = array();
    protected $method                 = 'POST';
    protected $option                 = array();
    protected $optiongroup_ID         = array();
    protected $plugins_path           = '';
    protected $plugins_url            = '';
    protected $radio                  = array();
    protected $radio_end_wrapper      = '';
    protected $radio_start_wrapper    = '';
    protected $recaptcha_error_text   = '';
    protected $token                  = '';
    protected $txt                    = '';
    public $error_msg                 = ''; // if iCheck is used with material
    public $html                      = '';

    /* plugins (colorpicker, datepicker, timepicker, captcha, fileupload) */

    protected $js_plugins          = array();

    protected $css_includes       = array();
    protected $js_includes        = array();
    protected $js_code            = '';
    protected $fileupload_js_code = '';

    /**
     * Defines the layout (horizontal | vertical | inline).
     * Default is 'horizontal'
     * Clears values from session if self::clear has been called before
     * Catches posted errors
     * Adds hidden field with form ID
     * Sets elements wrappers
     *
     * @param string $form_ID   The ID of the form
     * @param string $layout    (Optional) Can be 'horizontal', 'vertical' or 'inline'
     * @param string $attr      (Optional) Can be any HTML input attribute or js event EXCEPT class
     *                          (class is defined in layout param).
     *                          attributes must be listed separated with commas.
     *                          Example : novalidate,onclick=alert(\'clicked\');
     * @param string $framework (Optional) bs3 | material (Bootstrap 3 or Material design)
     * @return $this
     */
    public function __construct($form_ID, $layout = 'horizontal', $attr = '', $framework = 'bs3')
    {
        if(Form::$instances === null) {
            Form::$instances = array(
                'css_files' => array(),
                'js_files' => array()
            );
        }
        $this->form_ID     = $form_ID;
        $this->form_attr   = $attr;
        $this->layout      = $layout;
        $this->action      = htmlspecialchars($_SERVER["PHP_SELF"]);
        $this->framework   = $framework;
        $this->token       = $this->generateToken();

        // set framework options
        if ($framework == 'bs3') {
            $this->options = $this->bs3_options;
        } elseif ($framework == 'material') {
            $this->options = $this->material_options;
            if ($layout !== 'horizontal') {

                // remove row class from elements wrapper
                $this->setOptions(array('elementsWrapper' => '<div class="input-field"></div>'));
            }

            // include Materialize plugin
            $this->addPlugin('materialize', '#' . $this->form_ID);
        }
        if (!isset($_SESSION['clear_form'][$form_ID])) {
            $_SESSION['clear_form'][$form_ID] = false;
        } elseif ($_SESSION['clear_form'][$form_ID] === true) {
            $_SESSION['clear_form'][$form_ID] = false; // reset after clearing

        } elseif (isset($_POST[$form_ID])) {
            self::registerValues($form_ID);
        }
        if (isset($_SESSION['errors'][$form_ID])) {
            $this->registerErrors();
            unset($_SESSION['errors'][$form_ID]);
        }
        $this->elements_start_wrapper = $this->defineWrapper($this->options['elementsWrapper'], 'start');
        $this->elements_end_wrapper   = $this->defineWrapper($this->options['elementsWrapper'], 'end');
        $this->checkbox_start_wrapper = $this->defineWrapper($this->options['checkboxWrapper'], 'start');
        $this->checkbox_end_wrapper   = $this->defineWrapper($this->options['checkboxWrapper'], 'end');
        $this->helper_start_wrapper   = $this->defineWrapper($this->options['helperWrapper'], 'start');
        $this->helper_end_wrapper     = $this->defineWrapper($this->options['helperWrapper'], 'end');
        $this->radio_start_wrapper    = $this->defineWrapper($this->options['radioWrapper'], 'start');
        $this->radio_end_wrapper      = $this->defineWrapper($this->options['radioWrapper'], 'end');
        $this->addInput('hidden', 'token', $this->token);
        $this->addInput('hidden', $form_ID, true);

        return $this;
    }

    /**
     * set sending method
     * @param string $method POST|GET
     * @return $this
     */
    public function setMethod($method)
    {
        $this->method = $method;

        return $this;
    }

    /**
    * Redefines form action
    *
    * @param boolean $add_get_vars (Optional) If $add_get_vars is set to false,
    *                              url vars will be removed from destination page.
    *                              Example : www.myUrl.php?var=value => www.myUrl.php
    *
    * @return $this
    */
    public function setAction($url, $add_get_vars = true)
    {
        $this->action = $url;
        $this->add_get_vars = $add_get_vars;

        return $this;
    }

    /**
     * Sets form layout options to match your framework
     *
     * @param array $user_options (Optional) An associative array containing the
     *                            options names as keys and values as data.
     * @return $this
     */
    public function setOptions($user_options = array())
    {
        $formClassOptions = array('formInlineClass', 'formHorizontalClass', 'formVerticalClass', 'elementsWrapper', 'checkboxWrapper', 'helperWrapper', 'radioWrapper', 'wrapElementsIntoLabels', 'wrapCheckboxesIntoLabels', 'wrapRadiobtnsIntoLabels', 'elementsClass', 'wrapperErrorClass', 'elementsErrorClass', 'textErrorClass', 'horizontalLabelClass', 'horizontalLabelCol', 'horizontalOffsetCol', 'horizontalElementCol', 'inlineCheckboxLabelClass', 'inlineRadioLabelClass', 'inputGroupAddonClass', 'btnGroupClass', 'requiredMark', 'openDomReady', 'closeDomReady');
        foreach ($user_options as $key => $value) {
            if (in_array($key, $formClassOptions)) {
                $this->options[$key] = $value;

                /* redefining starting & ending wrappers if needed */

                if ($key == 'elementsWrapper') {
                    $this->elements_start_wrapper = $this->defineWrapper($this->options['elementsWrapper'], 'start');
                    $this->elements_end_wrapper   = $this->defineWrapper($this->options['elementsWrapper'], 'end');
                } elseif ($key == 'checkboxWrapper') {
                    $this->checkbox_start_wrapper = $this->defineWrapper($this->options['checkboxWrapper'], 'start');
                    $this->checkbox_end_wrapper   = $this->defineWrapper($this->options['checkboxWrapper'], 'end');
                } elseif ($key == 'helperWrapper') {
                    $this->helper_start_wrapper = $this->defineWrapper($this->options['helperWrapper'], 'start');
                    $this->helper_end_wrapper   = $this->defineWrapper($this->options['helperWrapper'], 'end');
                } elseif ($key == 'radioWrapper') {
                    $this->radio_start_wrapper = $this->defineWrapper($this->options['radioWrapper'], 'start');
                    $this->radio_end_wrapper   = $this->defineWrapper($this->options['radioWrapper'], 'end');
                }
            }
        }

        return $this;
    }

    /**
     * Shortcut for labels & cols options
     * @param number $labelsCols number of columns for label
     * @param number $fieldsCols number of columns for fields
     * @param string $breakpoint Bootstrap's breakpoints : xs | sm | md |lg
     * @return $this
     */
    public function setCols($labelsCols, $fieldsCols, $breakpoint = 'sm')
    {
        $labelsClass          = '';
        $labelsOffsetClass    = '';
        $horizontalElementCol = '';
        $options = array();
        if (!empty($labelsCols) && $labelsCols > 0) {
            $labelsClass = 'col-' . $breakpoint . '-' . $labelsCols;
            $labelsOffsetClass = 'col-' . $breakpoint . '-offset-' . $labelsCols;
        }
        if (!empty($fieldsCols) && $fieldsCols > 0) {
            $horizontalElementCol = 'col-' . $breakpoint . '-' . $fieldsCols;
        }
        if ($this->framework == 'bs3') {

            // Bootstrap 3
            $options = array(
                'horizontalLabelCol'       => $labelsClass,
                'horizontalOffsetCol'      => $labelsOffsetClass,
                'horizontalElementCol'     => $horizontalElementCol
            );
        } elseif ($this->framework == 'material') {

            // Material Design
            if (!empty($labelsCols) && $labelsCols > 0) {

                // Normal input with label in front
                // elementsWrapper with 2 col divs inside for label & field
                $options = array(
                    'horizontalLabelCol'       => $labelsClass,
                    'horizontalOffsetCol'      => $labelsOffsetClass,
                    'horizontalElementCol'     => $horizontalElementCol
                );
            } else {

                // Material input-field with label inside
                // elementsWrapper with row + col class, label & field directly inside
                $options = array(
                    'horizontalLabelCol'       => '',
                    'horizontalOffsetCol'      => '',
                    'horizontalElementCol'     => $horizontalElementCol
                );
            }
        }
        $this->setOptions($options);
        $this->elements_start_wrapper = $this->defineWrapper($this->options['elementsWrapper'], 'start');
        $this->elements_end_wrapper   = $this->defineWrapper($this->options['elementsWrapper'], 'end');

        return $this;
    }

    /**
     * Shortcut to add element helper text
     *
     * @param string $helper_text    The helper text or html to add.
     * @param string $element_name   the helper text will be inserted just after the element.
     * @return $this
     */
    public function addHelper($helper_text, $element_name)
    {
        if (!isset($this->html_element_content[$element_name])) {
            $this->html_element_content[$element_name] = array('before', 'after');
        }
        $this->html_element_content[$element_name]['after'][] = $this->helper_start_wrapper . $helper_text . $this->helper_end_wrapper;

        return $this;
    }

    /**
     * Adds HTML code at any place of the form
     *
     * @param string $html         The html code to add.
     * @param string $element_name (Optional) If not empty, the html code will be inserted
     *                             just before or after the element.
     * @param string $pos          (Optional) If $element_name is not empty, defines the position
     *                             of the inserted html code.
     *                             Values can be 'before' or 'after'.
     * @return $this
     */
    public function addHtml($html, $element_name = '', $pos = 'after')
    {
        if (!empty($element_name)) {
            if (!isset($this->html_element_content[$element_name])) {
                $this->html_element_content[$element_name] = array('before', 'after');
            }
            $this->html_element_content[$element_name][$pos][] = $html;
        } else {
            $this->html .= $html;
        }

        return $this;
    }

    /**
     * Wraps the element with html code.
     *
     * @param string $html         The html code to wrap the element with.
     *                             The html tag must be opened and closed.
     *                             Example : <div class="my-class"></div>
     * @param string $element_name The form element to wrap.
     * @return $this
     */
    public function addInputWrapper($html, $element_name)
    {
        $this->input_wrapper[$element_name] = $html;

        return $this;
    }

    /*=================================
    Elements
    =================================*/

    /**
     * Adds input to the form
     *
     * @param string $type  Accepts all input html5 types except checkbox and radio :
     *                      button, color, date, datetime, datetime-local,
     *                      email, file, hidden, image, month, number, password,
     *                      range, reset, search, submit, tel, text, time, url, week
     * @param string $name  The input name
     * @param string $value (Optional) The input default value
     * @param string $label (Optional) The input label
     * @param string $attr  (Optional) Can be any HTML input attribute or js event.
     *                      attributes must be listed separated with commas.
     *                      If you don't specify any ID as attr, the ID will be the name of the input.
     *                      Example : class=my-class,placeholder=My Text,onclick=alert(\'clicked\');
     * @return $this
     */
    public function addInput($type, $name, $value = '', $label = '', $attr = '')
    {
        if ($type == 'file') {
            $this->has_file = true;
        }
        $attr          = $this->getAttributes($attr); // returns linearised attributes (with ID)
        $array_values  = $this->getID($name, $attr); // if $attr contains no ID, field ID will be $name.
        $id            = $array_values['id'];
        $attr          = $array_values['attributs']; // if $attr contains an ID, we remove it.
        $attr          = $this->addElementClass($name, $attr);
        $value         = $this->getValue($name, $value);
        $start_wrapper = '';
        $end_wrapper   = '';
        $start_label   = '';
        $end_label     = '';
        $start_col     = '';
        $end_col       = '';
        $element       = '';
        if ($type == 'hidden') {
            $this->hidden_fields .= '<input name="' . $name . '" type="hidden" value="' . $value . '" ' . $attr . '>';
        } else {

            // form-group wrapper
            $start_wrapper = $this->setInputGroup($name, 'start');
            $start_wrapper .= $this->addErrorWrapper($name, 'start');

            // label
            if (!empty($label)) {
                $start_label = '<label for="' . $id . '"' . $this->getLabelClass() . '>' . $this->getRequired($label, $attr);
                $end_label = '</label>';
            }

            // input
            $start_col .= $this->getElementCol('start', $label); // col-sm-8
            $element .= $this->getErrorInputWrapper($name, $label, 'start'); // has-error
            $element .= $this->getHtmlElementContent($name, 'before', 'outside_wrapper');
            if (isset($this->input_wrapper[$name])) {
                $element .= $this->defineWrapper($this->input_wrapper[$name], 'start'); // input-group
            }
            $element .= $this->getHtmlElementContent($name, 'before', 'inside_wrapper');
            $element .= '<input id="' . $id . '" name="' . $name . '" type="' . $type . '" value="' . $value . '" ' . $attr . '>';
            $element .= $this->getHtmlElementContent($name, 'after', 'inside_wrapper');
            if (isset($this->input_wrapper[$name])) {
                $element .= $this->defineWrapper($this->input_wrapper[$name], 'end'); // end input-group
            }
            $element .= $this->getHtmlElementContent($name, 'after', 'outside_wrapper');
            $element .= $this->getErrorInputWrapper($name, $label, 'end'); // end has-error
            $element .= $this->getError($name);
            $end_col .= $this->getElementCol('end'); // end col-sm-8
            $end_wrapper .= $this->addErrorWrapper($name, 'end');
            $end_wrapper .= $this->setInputGroup($name, 'end'); // end form-group

            // output
            $this->html .= $this->outputElement($start_wrapper, $end_wrapper, $start_label, $end_label, $start_col, $end_col, $element);
        }
        $this->registerField($name, $attr);

        return $this;
    }

    /**
     * Creates an input with fileupload plugin.
     *
     * The fileupload plugin generates complete html, js and css code.
     * You'll just have to call printIncludes('css') and printIncludes('js')
     * where you wants to put your css/js codes (generaly in <head> and just before </body>).
     *
     * @param string $type              The node of the plugins-config/fileupload.xml file where is your code.
     *                                  For example : 'default' or 'images'
     * @param string $name              The upload field name.
     *                                  Use an array (ex : name[]) to allow multiple files upload
     * @param string $value             (Optional) The input default value
     * @param string $label             (Optional) The input label
     * @param string $attr              (Optional) Can be any HTML input attribute or js event.
     *                                  attributes must be listed separated with commas.
     *                                  If you don't specify any ID as attr, the ID will be the name of the input.
     *                                  Example : class=my-class,placeholder=My Text,onclick=alert(\'clicked\');.
     * @param array  $fileUpload_config (Optional) An associative array containing :
     *                                  'xml'                 => The xml node where your plugin code is
     *                                  in plugins-config/fileupload.xml,
     *                                  'uploader'            => The php uploader file in
     *                                  plugins/jQuery-File-Upload-9.5.8/server/php/ folder
     *                                  'btn-text'            => The text of the upload button,
     *                                  'max-number-of-files' => The max number of files to upload
     * @return $this
     *
     */
    public function addFileUpload($type, $name, $value = '', $label = '', $attr = '', $fileUpload_config = '')
    {
        $this->has_file = true;
        $attr           = $this->getAttributes($attr); // returns linearised attributes (with ID)
        $array_values   = $this->getID($name, $attr); // if $attr contains no ID, field ID will be $name.
        $attr           = $array_values['attributs']; // if $attr contains an ID, we remove it.
        $attr           = $this->addElementClass($name, $attr);
        $value          = $this->getValue($name, $value);
        $start_wrapper  = '';
        $end_wrapper    = '';
        $start_label    = '';
        $end_label      = '';
        $start_col      = '';
        $end_col        = '';
        $element        = '';

        /* adding plugin */

        if (!isset($fileUpload_config['xml'])) {
            $fileUpload_config['xml'] = 'default';
        }
        if (!isset($fileUpload_config['uploader'])) {
            $fileUpload_config['uploader'] = 'defaultFileUpload.php';
        }
        if (!isset($fileUpload_config['btn-text'])) {
            $fileUpload_config['btn-text'] = 'Select files...';
        }
        if (!isset($fileUpload_config['max-number-of-files'])) {
            $fileUpload_config['max-number-of-files'] = 1;
        }
        if(empty($this->plugins_url)) {
            $this->setPluginsUrl();
        }

        /* remove [] from name if array of files */

        if (preg_match('`\[\]`', $name)) {
            $uploaderId = preg_replace('`\[\]`', '', $name);
        } else {
            $uploaderId = $name;
        }
        $xml_replacements = array('%uploader%' => $fileUpload_config['uploader'], '%max-number-of-files%' => $fileUpload_config['max-number-of-files'], '%PLUGINS_DIR%' => $this->plugins_url, '%file-input%' => $name, '%uploader-id%' => $uploaderId);
        $this->addPlugin('fileupload', '#' . $this->form_ID, $fileUpload_config['xml'], $xml_replacements);
        if (!empty($this->options['elementsWrapper'])) {
            $start_wrapper = $this->elements_start_wrapper;
        }
        if (!empty($label)) {
            $start_label = '<label for="' . $name . '"' . $this->getLabelClass('fileinput') . '>';
            if (in_array($name, array_keys($this->error_fields))) {
                $start_label .= '<span class="text-danger">' . $this->getRequired($label, $attr) . '</span>';
            } else {
                $start_label .=$this->getRequired($label, $attr);
            }
            $end_label = '</label>';
        }
        $element = $this->getElementCol('start', $label);
        if (isset($this->input_wrapper[$name])) {
            $element .= $this->defineWrapper($this->input_wrapper[$name], 'start');
        }
        $element .= $this->getHtmlElementContent($name, 'before');

        /* getting html_code from xml */

        if(file_exists(dirname(__FILE__) . '/plugins-config-custom/fileupload.xml')) {

            // if custom config xml file
            $xml = simplexml_load_file(dirname(__FILE__) . '/plugins-config-custom/fileupload.xml');

            // if node doesn't exist, fallback to default xml
            if(!isset($xml->{$fileUpload_config['xml']}->html_code)) {
                $xml = simplexml_load_file(dirname(__FILE__) . '/plugins-config/fileupload.xml');
            }
        } else {
            $xml = simplexml_load_file(dirname(__FILE__) . '/plugins-config/fileupload.xml');
        }
        $html_code = $xml->{$fileUpload_config['xml']}->html_code;
        $search    = array('`%input_name%`', '`%btn-text%`');
        $replace   = array($name, $fileUpload_config['btn-text']);
        $element .= preg_replace($search, $replace, $html_code);
        $element .= $this->getHtmlElementContent($name, 'after');
        if (isset($this->input_wrapper[$name])) {
            $element .= $this->defineWrapper($this->input_wrapper[$name], 'end');
        }
        $element .= $this->getElementCol('end');
        if (!empty($this->options['elementsWrapper'])) {
            $end_wrapper = $this->elements_end_wrapper;
        }
        // output
        $this->html .= $this->outputElement($start_wrapper, $end_wrapper, $start_label, $end_label, $start_col, $end_col, $element);
        $this->registerField($name, $attr);

        return $this;
    }

    /**
     * Adds textarea to the form
     * @param string $name  The textarea name
     * @param string $value (Optional) The textarea default value
     * @param string $label (Optional) The textarea label
     * @param string $attr  (Optional) Can be any HTML input attribute or js event.
     *                      attributes must be listed separated with commas.
     *                      If you don't specify any ID as attr, the ID will be the name of the textarea.
     *                      Example : cols=30, rows=4;
     * @return $this
     */
    public function addTextarea($name, $value = '', $label = '', $attr = '')
    {
        $attr          = $this->getAttributes($attr); // returns linearised attributes (with ID)
        $array_values  = $this->getID($name, $attr); // if $attr contains no ID, field ID will be $name.
        $id            = $array_values['id'];
        $attr          = $array_values['attributs']; // if $attr contains an ID, we remove it.
        $attr          = $this->addElementClass($name, $attr);
        $start_wrapper = '';
        $end_wrapper   = '';
        $start_label   = '';
        $end_label     = '';
        $start_col     = '';
        $end_col       = '';
        $element       = '';
        if ($this->framework == 'material') {
            $attr         = $this->addElementClass($name, 'class="materialize-textarea"');
        }
        $value        = $this->getValue($name, $value);
        // form-group wrapper
        $start_wrapper = $this->setInputGroup($name, 'start');
        $start_wrapper .= $this->addErrorWrapper($name, 'start');
        if (!empty($label)) {
            $start_label = '<label for="' . $id . '"' . $this->getLabelClass() . '>' . $this->getRequired($label, $attr);
            $end_label = '</label>';
        }
        $start_col .= $this->getElementCol('start', $label);
        $element .= $this->getErrorInputWrapper($name, $label, 'start');
        $element .= $this->getHtmlElementContent($name, 'before');
        $element .= '<textarea id="' . $id . '" name="' . $name . '" ' . $attr . '>' . $value . '</textarea>';
        $element .= $this->getHtmlElementContent($name, 'after');
        $element .= $this->getError($name);
        $element .= $this->getErrorInputWrapper($name, $label, 'end');
        $end_col .= $this->getElementCol('end');
        $end_wrapper = $this->addErrorWrapper($name, 'end');
        $end_wrapper .= $this->setInputGroup($name, 'end'); // end form-group
        $this->html .= $this->outputElement($start_wrapper, $end_wrapper, $start_label, $end_label, $start_col, $end_col, $element);
        $this->registerField($name, $attr);

        return $this;
    }

    /**
     * Adds option to the $select_name element
     *
     * IMPORTANT : Always add your options BEFORE creating the select element
     *
     * @param string $select_name The name of the select element
     * @param string $value       The option value
     * @param string $txt         The text that will be displayed
     * @param string $group_name  (Optional) the optgroup name
     * @param string $attr        (Optional) Can be any HTML input attribute or js event.
     *                            attributes must be listed separated with commas.
     *                            If you don't specify any ID as attr, the ID will be the name of the option.
     *                            Example : class=my-class
     * @return $this
     */
    public function addOption($select_name, $value, $txt, $group_name = '', $attr = '')
    {
        $optionValues = array('value' => $value, 'txt' => $txt, 'attributs' => $attr);
        if (!empty($group_name)) {
            $this->option[$select_name][$group_name][] = $optionValues;
            if (!isset($this->group_name[$select_name])) {
                $this->group_name[$select_name] = array();
            }
            if (!in_array($group_name, $this->group_name[$select_name])) {
                $this->group_name[$select_name][] = $group_name;
            }
        } else {
            $this->option[$select_name][] = $optionValues;
        }

        return $this;
    }

    /**
     * Adds a select element
     *
     * IMPORTANT : Always add your options BEFORE creating the select element
     *
     * @param string $select_name        The name of the select element
     * @param string $label              (Optional) The select label
     * @param string $attr               (Optional)  Can be any HTML input attribute or js event.
     *                                   attributes must be listed separated with commas.
     *                                   If you don't specify any ID as attr, the ID will be the name of the input.
     *                                   Example : class=my-class
     * @param string $displayGroupLabels (Optional) True or false.
     *                                   Default is true.
     * @return $this
     */
    public function addSelect($select_name, $label = '', $attr = '', $displayGroupLabels = true)
    {
        $attr          = $this->getAttributes($attr); // returns linearised attributes (with ID)
        $array_values  = $this->getID($select_name, $attr); // if $attr contains no ID, field ID will be $select_name.
        $id            = $array_values['id'];
        $attr          = $array_values['attributs']; // if $attr contains an ID, we remove it.
        if ($this->framework !== 'material') { // don't add form-group if material
            $attr          = $this->addElementClass($select_name, $attr);
        }
        $form_ID       = $this->form_ID;
        $start_wrapper = '';
        $end_wrapper   = '';
        $start_label   = '';
        $end_label     = '';
        $start_col     = '';
        $end_col       = '';
        $element       = '';

        // form-group wrapper
        $start_wrapper = $this->setInputGroup($select_name, 'start');
        $start_wrapper .= $this->addErrorWrapper($select_name, 'start');
        if (!empty($label)) {
            $start_label = '<label for="' . $id . '"' . $this->getLabelClass() . '>' . $this->getRequired($label, $attr);
            $end_label = '</label>';
        }
        $start_col .= $this->getElementCol('start', $label);
        $element .= $this->getErrorInputWrapper($select_name, $label, 'start');
        $element .= $this->getHtmlElementContent($select_name, 'before', 'outside_wrapper');
        if (isset($this->input_wrapper[$select_name])) {
            $element .= $this->defineWrapper($this->input_wrapper[$select_name], 'start');
        }
        $element .= $this->getHtmlElementContent($select_name, 'before', 'inside_wrapper');
        $element .= '<select id="' . $id . '" name="' . $select_name . '" ' . $attr . '>';
        if (isset($this->group_name[$select_name])) {
            foreach ($this->group_name[$select_name] as $group_name) {
                $nbreOptions = count($this->option[$select_name][$group_name]);
                $groupLabel = '';
                if ($displayGroupLabels == true) {
                    $groupLabel = ' label="' . $group_name . '"';
                }
                $element .= '<optgroup' . $groupLabel . '>';
                for ($i=0; $i<$nbreOptions; $i++) {
                    $txt = $this->option[$select_name][$group_name][$i]['txt'];
                    $value = $this->option[$select_name][$group_name][$i]['value'];
                    $option_attr = $this->option[$select_name][$group_name][$i]['attributs'];
                    $option_attr = $this->getAttributes($option_attr);
                    $element .= '<option value="' . $value . '"';
                    $option_attr = $this->getCheckedOrSelected($select_name, $value, $option_attr, 'select');
                    $element .= ' ' . $option_attr . '>' . $txt . '</option>';
                }
                $element .= '</optgroup>';
            }
        } else {
            $nbreOptions = 0;
            if(isset($this->option[$select_name])) {
                $nbreOptions = count($this->option[$select_name]);
            }
            for ($i=0; $i<$nbreOptions; $i++) {
                $txt = $this->option[$select_name][$i]['txt'];
                $value = $this->option[$select_name][$i]['value'];
                $option_attr = $this->option[$select_name][$i]['attributs'];
                $option_attr = $this->getAttributes($option_attr);
                $element .= '<option value="' . $value . '"';
                $option_attr = $this->getCheckedOrSelected($select_name, $value, $option_attr, 'select');
                $element .= ' ' . $option_attr . '>' . $txt . '</option>';
            }
        }
        $element .= '</select>';
        $element .= $this->getHtmlElementContent($select_name, 'after', 'inside_wrapper');
        if (isset($this->input_wrapper[$select_name])) {
            $element .= $this->defineWrapper($this->input_wrapper[$select_name], 'end');
        }
        $element .= $this->getHtmlElementContent($select_name, 'after', 'outside_wrapper');
        $element .= $this->getErrorInputWrapper($select_name, $label, 'end');
        $element .= $this->getError($select_name);
        $end_col .= $this->getElementCol('end');
        $end_wrapper = $this->addErrorWrapper($select_name, 'end');
        $end_wrapper .= $this->setInputGroup($select_name, 'end'); // end form-group
        if (preg_match('`selectpicker`', $attr)) {
            if (!in_array('bootstrap-select', $this->js_plugins)) {
                $this->addPlugin('bootstrap-select', '.selectpicker', 'default-selectpicker');
            }
        }

        // output
        $this->html .= $this->outputElement($start_wrapper, $end_wrapper, $start_label, $end_label, $start_col, $end_col, $element);
        $this->registerField($select_name, $attr);

        return $this;
    }

    /**
     * adds a country select list with flags
     * @param array  $select_name
     * @param string $label        (Optional) The select label
     * @param string $attr         (Optional)  Can be any HTML input attribute or js event.
     *                             attributes must be listed separated with commas.
     *                             If you don't specify any ID as attr, the ID will be the name of the input.
     *                             Example : class=my-class
     * @param array  $user_options (Optional) :
     *                             lang            : MUST correspond to one subfolder of [$this->plugins_url]countries/country-list/country/cldr/
     *                             *** for example 'en', or 'fr_FR'                 Default : 'en'
     *                             flags           : true or false.                 Default : true
     *                             *** displays flags into option list
     *                             flag_size       : 16 or 32                       Default : 32
     *                             return_value    : 'name' or 'code'               Default : 'name'
     *                             *** type of the value that will be returned
     *                             show_tick       : true or false
     *                             *** shows a checkmark beside selected options    Default : true
     *                             live_search     : true or false                  Default : true
     * @return $this
    */
    public function addCountrySelect($select_name, $label = '', $attr = '', $user_options = array())
    {

        /* define options*/

        $options = array(
            'lang' => 'en',
            'flags' => true,
            'flag_size' => 32,
            'return_value' => 'name',
            'show_tick' => true,
            'live_search' => true
        );
        foreach ($user_options as $key => $value) {
            if (in_array($key, $options)) {
                $options[$key] = $value;
            }
        }
        $class = '';
        if (preg_match('`class(\s)?=(\s)?([^,])+`', $attr, $out)) {
            $class = $out[3] . ' ';
        }
        $class .= 'selectpicker ' . $this->options['elementsClass'];
        if ($options['flags'] == true) {
            $class .= ' f' . $options['flag_size'];
            $xml_node = 'countries-flags-' . $options['flag_size'];
        } else {
            $xml_node = 'default-selectpicker';
        }
        if ($options['show_tick'] == true) {
            $class .= ' show-tick';
        }
        $live_search = '';
        if ($options['live_search'] == true) {
            $live_search .= ' data-live-search="true" ';
        }
        $this->addPlugin('bootstrap-select', '.selectpicker', $xml_node);
        $countries    = include $this->plugins_path . 'countries/country-list/country/cldr/' . $options['lang'] . '/country.php';
        $attr         = $this->getAttributes($attr); // returns linearised attributes (with ID)
        $array_values = $this->getID($select_name, $attr); // if $attr contains no ID, field ID will be $select_name.
        $id           = $array_values['id'];
        $attr         = $array_values['attributs']; // if $attr contains an ID, we remove it.
        $attr         = $this->removeAttr('class', $attr);
        $start_wrapper = '';
        $end_wrapper   = '';
        $start_label   = '';
        $end_label     = '';
        $start_col     = '';
        $end_col       = '';
        $element       = '';
        $start_wrapper = $this->setInputGroup($select_name, 'start');
        $start_wrapper .= $this->addErrorWrapper($select_name, 'start');
        if (!empty($label)) {
            $start_label = '<label for="' . $id . '"' . $this->getLabelClass() . '>' . $this->getRequired($label, $attr);
            $end_label = '</label>';
        }
        $start_col .= $this->getElementCol('start', $label);
        $element .= $this->getErrorInputWrapper($select_name, $label, 'start');
        $element .= $this->getHtmlElementContent($select_name, 'before');
        $element .= '<select name="' . $select_name . '" id="' . $id . '" class="' . $class . '"' . $live_search . $attr . '>';
        $option_list = '';
        if ($options['return_value'] == 'name') {
            foreach ($countries as $country_code => $country_name) {
                $option_list .= '<option value="' . $country_name . '" class="flag ' . mb_strtolower($country_code) . '"';
                $option_attr = $this->getCheckedOrSelected($select_name, $country_name, '', 'select');
                $option_list .= ' ' . $option_attr . '>' . $country_name . '</option>';
            }
        } else {
            foreach ($countries as $country_code => $country_name) {
                $option_list .= '<option value="' . $country_code . '" class="flag ' . mb_strtolower($country_code) . '"';
                $option_attr = $this->getCheckedOrSelected($select_name, $country_code, '', 'select');
                $option_list .= ' ' . $option_attr . '>' . $country_name . '</option>';
            }
        }
        $element .= $option_list;
        $element .= '</select>';
        $element .= $this->getHtmlElementContent($select_name, 'after');
        $element .= $this->getError($select_name);
        $element .= $this->getErrorInputWrapper($select_name, $label, 'end');
        $end_col .= $this->getElementCol('end');
        $end_wrapper = $this->addErrorWrapper($select_name, 'end');
        $end_wrapper .= $this->setInputGroup($select_name, 'end'); // end form-group

        // output
        $this->html .= $this->outputElement($start_wrapper, $end_wrapper, $start_label, $end_label, $start_col, $end_col, $element);
        $this->registerField($select_name, $attr);

        return $this;
    }

    /**
     * Adds radio button to $group_name element
     *
     * @param string $group_name The radio button groupname
     * @param string $label      The radio button label
     * @param string $value      The radio button value
     * @param string $attr       (Optional) Can be any HTML input attribute or js event.
     *                           attributes must be listed separated with commas.
     *                           Example : checked=checked
     * @return $this
     */
    public function addRadio($group_name, $label, $value, $attr = '')
    {
        $this->radio[$group_name]['label'][]  = $label;
        $this->radio[$group_name]['value'][]  = $value;
        $this->radio[$group_name]['attr'][]  = $attr;

        return $this;
    }

    /**
     * Prints radio buttons group.
     *
     * @param string $group_name The radio button group name
     * @param string $label      (Optional) The radio buttons group label
     * @param string $inline     (Optional) True or false.
     *                           Default is true.
     * @param string $attr       (Optional) Can be any HTML input attribute or js event.
     *                           attributes must be listed separated with commas.
     *                           Example : class=my-class
     * @return $this
     */
    public function printRadioGroup($group_name, $label = '', $inline = true, $attr = '')
    {
        $form_ID       = $this->form_ID;
        $start_wrapper = '';
        $end_wrapper   = '';
        $start_label   = '';
        $end_label     = '';
        $start_col     = '';
        $end_col       = '';
        $element       = '';
        $start_wrapper = $this->setInputGroup($group_name, 'start');
        $start_wrapper .= $this->addErrorWrapper($group_name, 'start');
        if (!empty($label)) {
            $attr          = $this->getAttributes($attr); // returns linearised attributes (with ID)
            $attr          = $this->addClass('main-label', $attr);
            if ($this->layout == 'horizontal') {
                $class     = $this->options['horizontalLabelCol'] . ' ' . $this->options['horizontalLabelClass'];
                $attr      = $this->addClass($class, $attr);
            }
            $start_label = '<label ' . $attr . '>' . $this->getRequired($label, $attr);
            $end_label = '</label>';
        }
        $required = '';
        if (preg_match('`required`', $attr)) {
            $required = ' required';
        }
        $start_col .= $this->getElementCol('start', $label);
        $element .= $this->getErrorInputWrapper($group_name, $label, 'start');
        $element .= $this->getHtmlElementContent($group_name, 'before');
        for ($i=0; $i < count($this->radio[$group_name]['label']); $i++) {
            $radio_start_label   = '';
            $radio_end_label     = '';
            $radio_input         = '';
            if (!empty($this->options['radioWrapper']) && $inline !== true) {
                $element .= $this->radio_start_wrapper;
            }
            $radio_label  = $this->radio[$group_name]['label'][$i];
            $radio_value  = $this->radio[$group_name]['value'][$i];
            $radio_attr   = $this->getAttributes($this->radio[$group_name]['attr'][$i]); // returns linearised attributes (with ID)
            if ($this->framework == 'material') {
                $radio_attr = $this->addElementClass($group_name, 'class="with-gap"');
            }
            $radio_start_label .= '<label for="' . $group_name . '_' . $i . '" ' . $this->getLabelClass('radio', $inline) . '>';
            $radio_input .= '<input type="radio" id="' . $group_name . '_' . $i . '" name="' . $group_name . '" value="' . $radio_value . '"';
            if (isset($_SESSION[$form_ID][$group_name])) {
                if ($_SESSION[$form_ID][$group_name] == $radio_value) {
                    if (!preg_match('`checked`', $radio_attr)) {
                        $radio_input .= ' checked="checked"';
                    }
                } else { // we remove 'checked' from $radio_attr as user has previously checked another, memorized in session.
                    $radio_attr = $this->removeAttr('checked', $radio_attr);
                }
            }
            $radio_input .= $required . ' ' . $radio_attr . '>';

            $radio_end_label = $radio_label . '</label>';
            if ($this->options['wrapRadiobtnsIntoLabels'] === true) {
                $element .= $radio_start_label . $radio_input . $radio_end_label;
            } else {
                $element .= $radio_input . $radio_start_label . $radio_end_label;
            }
            if (!empty($this->options['radioWrapper']) && $inline !== true) {
                $element .= $this->radio_end_wrapper;
            }
        }
        $element .= $this->getHtmlElementContent($group_name, 'after');
        $element .= $this->getError($group_name);
        $element .= $this->getErrorInputWrapper($group_name, $label, 'end');
        $end_col .= $this->getElementCol('end');
        $end_wrapper = $this->addErrorWrapper($group_name, 'end');
        $end_wrapper .= $this->setInputGroup($group_name, 'end'); // end form-group
        $this->html .= $this->outputElement($start_wrapper, $end_wrapper, $start_label, $end_label, $start_col, $end_col, $element);
        $this->registerField($group_name, $attr);

        return $this;
    }

    /**
     * Adds checkbox to $group_name
     *
     * @param string $group_name The checkbox button groupname
     * @param string $label      The checkbox label
     * @param string $value      The checkbox value
     * @return $this
     */
    public function addCheckbox($group_name, $label, $value, $attr = '')
    {
        $form_ID                                             = $this->form_ID;
        $this->checkbox[$group_name]['label'][]              = $label;
        $this->checkbox[$group_name]['value'][]              = $value;
        $this->checkbox[$group_name]['attr'][]               = $attr;

        return $this;
    }

    /**
     * Prints checkbox group.
     *
     * @param string $var (Optional) description
     *
     * @param string $group_name The checkbox group name (will be converted to an array of indexed value)
     * @param string $label      (Optional) The checkbox group label
     * @param string $inline     (Optional) True or false.
     *                           Default is true.
     * @param string $attr       (Optional) Can be any HTML input attribute or js event.
     *                           attributes must be listed separated with commas.
     *                           Example : class=my-class
     * @return $this
     */
    public function printCheckboxGroup($group_name, $label = '', $inline = true, $attr = '')
    {
        $form_ID = $this->form_ID;
        $start_wrapper = '';
        $end_wrapper   = '';
        $start_label   = '';
        $end_label     = '';
        $start_col     = '';
        $end_col       = '';
        $element       = '';
        $start_wrapper = $this->setInputGroup($group_name, 'start');
        $start_wrapper .= $this->addErrorWrapper($group_name, 'start');
        if (!empty($label)) {
            $start_label = '<label' . $this->addClass('main-label', $this->getLabelClass()) . '>' . $this->getRequired($label, $attr);
            $end_label = '</label>';
        }
        $start_col .= $this->getElementCol('start', $label);
        $element .= $this->getErrorInputWrapper($group_name, $label, 'start');
        $element .= $this->getHtmlElementContent($group_name, 'before');
        for ($i=0; $i < count($this->checkbox[$group_name]['label']); $i++) {
            $checkbox_start_label   = '';
            $checkbox_end_label     = '';
            $checkbox_input         = '';
            if (!empty($this->options['checkboxWrapper']) && $inline !== true) {
                $element .= $this->checkbox_start_wrapper;
            }
            $checkbox_label = $this->checkbox[$group_name]['label'][$i];
            $checkbox_value = $this->checkbox[$group_name]['value'][$i];
            $checkbox_attr = $this->getAttributes($this->checkbox[$group_name]['attr'][$i]);
            $checkbox_start_label = '<label for="' . $group_name . '_' . $i . '"' . $this->getLabelClass('checkbox', $inline) . '>';
            $checkbox_input = '<input type="checkbox" id="' . $group_name . '_' . $i . '" name="' . $group_name . '[]" value="' . $checkbox_value . '"';
            $checkbox_attr = $this->getCheckedOrSelected($group_name, $checkbox_value, $checkbox_attr, 'checkbox');
            $checkbox_input .= ' ' . $checkbox_attr . '>';
            $checkbox_end_label = $checkbox_label . '</label>';

            if ($this->options['wrapCheckboxesIntoLabels'] === true) {
                $element .= $checkbox_start_label . $checkbox_input . $checkbox_end_label;
            } else {
                $element .= $checkbox_input . $checkbox_start_label . $checkbox_end_label;
            }
            if (!empty($this->options['checkboxWrapper']) && $inline !== true) {
                $element .= $this->checkbox_end_wrapper;
            }
        }
        $element .= $this->getHtmlElementContent($group_name, 'after');
        $element .= $this->getError($group_name);
        $element .= $this->getErrorInputWrapper($group_name, $label, 'end');
        $end_col .= $this->getElementCol('end');
        $end_wrapper = $this->addErrorWrapper($group_name, 'end');
        $end_wrapper .= $this->setInputGroup($group_name, 'end'); // end form-group
        $this->html .= $this->outputElement($start_wrapper, $end_wrapper, $start_label, $end_label, $start_col, $end_col, $element);
        $this->registerField($group_name, $attr);

        return $this;
    }

    /**
     * Adds button to the form
     *
     * If $btnGroupName is empty, the button will be automaticly displayed.
     * Otherwise, you'll have to call printBtnGroup to display your btnGroup.
     *
     * @param string $type         The html button type
     * @param string $name         The button name
     * @param string $value        The button value
     * @param string $text         The button text
     * @param string $attr         (Optional) Can be any HTML input attribute or js event.
     *                             attributes must be listed separated with commas.
     *                             If you don't specify any ID as attr, the ID will be the name of the input.
     *                             Example : class=my-class,onclick=alert(\'clicked\');
     * @param string $btnGroupName (Optional) If you wants to group several buttons, group them then call printBtnGroup.
     * @return $this
     */
    public function addBtn($type, $name, $value, $text, $attr = '', $btnGroupName = '')
    {

        /*  if $btnGroupName isn't empty, we just store values
        *   witch will be called back by printBtnGroup($btnGroupName)
        *   else we store the values in a new array, then call immediately printBtnGroup($btnGroupName)
        */

        if (empty($btnGroupName)) {
            $btnGroupName = 'btn-alone';
            $this->btn[$btnGroupName] = array();
        }

        $this->btn[$btnGroupName]['type'][] = $type;
        $this->btn[$btnGroupName]['name'][] = $name;
        $this->btn[$btnGroupName]['value'][] = $value;
        $this->btn[$btnGroupName]['text'][] = $text;
        $this->btn[$btnGroupName]['attr'][] = $attr;

        /*  if $btnGroupName was empty the button is displayed. */

        if ($btnGroupName == 'btn-alone') {
            $this->printBtnGroup($btnGroupName);
        }

        return $this;
    }

    /**
     * Prints buttons group.
     *
     * @param string $btnGroupName The buttons group name
     * @param string $label        (Optional) The buttons group label
     * @return $this
     */
    public function printBtnGroup($btnGroupName, $label = '')
    {
        $btn_alone = false;
        $btn_name  = '';
        $start_wrapper = '';
        $end_wrapper   = '';
        $start_label   = '';
        $end_label     = '';
        $start_col     = '';
        $end_col       = '';
        $element       = '';
        if ($btnGroupName == 'btn-alone') {
            $btn_alone = true;
            $btn_name  = $this->btn[$btnGroupName]['name'][0];
        }
        if (!empty($this->options['elementsWrapper'])) {
            if ($btn_alone === true) { // if single btn, can be grouped with another input
                $start_wrapper = $this->setInputGroup($btn_name, 'start');
            } else {
                $start_wrapper = $this->elements_start_wrapper;
            }
        }
        if (!empty($label)) {
            $start_label = '<label' . $this->getLabelClass() . '>' . $label;
            $end_label = '</label>';
        }
        $start_col .= $this->getElementCol('start', $label);
        if (!empty($this->options['btnGroupClass']) && $btn_alone === false) {
            $element .= '<div class="' . $this->options['btnGroupClass'] . '">';
        }
        $element .= $this->getHtmlElementContent($btnGroupName, 'before');
        if ($btn_alone === true) {
            if (isset($this->input_wrapper[$btn_name])) {
                $element .= $this->defineWrapper($this->input_wrapper[$btn_name], 'start'); // input-group-btn
            }
        }
        for ($i=0; $i < count($this->btn[$btnGroupName]['type']); $i++) {
            $btn_type     = $this->btn[$btnGroupName]['type'][$i];
            $btn_name     = $this->btn[$btnGroupName]['name'][$i];
            $btn_value    = $this->btn[$btnGroupName]['value'][$i];
            $btn_text     = $this->btn[$btnGroupName]['text'][$i];
            $btn_attr     = $this->btn[$btnGroupName]['attr'][$i];
            $btn_attr     = $this->getAttributes($btn_attr); // returns linearised attributes (with ID)
            $array_values = $this->getID($btn_name, $btn_attr); // if $btn_attr contains no ID, field ID will be $btn_name.
            $id           = $array_values['id'];
            $btn_attr     = $array_values['attributs']; // if $btn_attr contains an ID, we remove it.
            $btn_value    = $this->getValue($btn_name, $btn_value);
            $element .= '<button type="' . $btn_type . '" name="' . $btn_name . '" value="' . $btn_value . '" ' . $btn_attr . '>' . $btn_text . '</button>';
        }
        if (isset($this->input_wrapper[$btn_name])) {
            $element .= $this->defineWrapper($this->input_wrapper[$btn_name], 'end'); // end input-group-btn
        }
        $element .= $this->getHtmlElementContent($btnGroupName, 'after');
        if (!empty($this->options['btnGroupClass']) && $btn_alone === false) {
            $element .= '</div>';
        }
        $end_col .= $this->getElementCol('end');
        if (!empty($this->options['elementsWrapper'])) {
            if ($btn_alone === true) { // if single btn, can be grouped with another input
                $end_wrapper .= $this->setInputGroup($btn_name, 'end'); // end form-group
            } else {
                $end_wrapper .= $this->elements_end_wrapper;
            }
        }
        $this->html .= $this->outputElement($start_wrapper, $end_wrapper, $start_label, $end_label, $start_col, $end_col, $element);

        return $this;
    }

    /**
     * Starts a fieldset tag.
     * @param string $legend (Optional) Legend of the fieldset.
     * @param string $fieldset_attr (Optional) Fieldset attributes.
     * @param string $legend_attr (Optional) Legend attributes.
     * @return $this
     */
    public function startFieldset($legend = '', $fieldset_attr = '', $legend_attr = '')
    {
        if(!empty($fieldset_attr)) {
            $fieldset_attr = ' ' . $this->getAttributes($fieldset_attr);
        }
        if(!empty($legend_attr)) {
            $legend_attr = ' ' . $this->getAttributes($legend_attr);
        }
        $this->html .= '<fieldset' . $fieldset_attr . '>';
        if (!empty($legend)) {
            $this->html .= '<legend' . $legend_attr . '>' . $legend . '</legend>';
        }

        return $this;
    }

    /**
     * Ends a fieldset tag.
     * @return $this
     */
    public function endFieldset()
    {
        if (!empty($this->btn_submit)) {
            // si endFieldset en fin de formulaire
            $this->end_fieldset .= '</fieldset>';
        } else {
            $this->html .= '</fieldset>';
        }

        return $this;
    }

    /**
     * Adds a Google recaptcha field
     * @param [type] $sitekey Google recaptcha key
     * @return $this
     */
    public function addRecaptcha($sitekey)
    {
        $this->addHtml('<div id="recaptcha" class="g-recaptcha" data-sitekey="' . $sitekey . '"></div>');

        if($this->has_recaptcha_error == true) {
            $this->addHtml('<p class="text-danger">' . $this->recaptcha_error_text . '</p>');
        }
        $this->addHtml('<br>');
        $this->addPlugin('recaptcha', '');

        return $this;
    }

    /**
     * shortcut to prepend or append icon to an input
     * @param string $input_name the name of target input
     * @param string $icon_html  icon html code
     * @param string $pos        before | after
     * @return $this
     */
    public function addIcon($input_name, $icon_html, $pos)
    {
        if ($this->framework == 'bs3') {
            $this->addInputWrapper('<div class="input-group"></div>', $input_name);
        } elseif ($this->framework == 'material') {
            $icon_html = $this->addClass('prefix', $icon_html);
        }
        if (!empty($this->options['inputGroupAddonClass'])) {
            $this->addHtml('<div class="' . $this->options['inputGroupAddonClass'] . '">' . $icon_html . '</div>', $input_name, $pos);
        } else {
            $this->addHtml($icon_html, $input_name, $pos);
        }

        return $this;
    }

    /**
     * Start a hidden block
     * which can contain any element and html
     * Hiden block will be shown on $parent_field change
     * if $parent_field value matches one of $show_values
     * @param  string $parent_field name of the field which will trigger show/hide
     * @param  string $show_values  single value or space separated values which will trigger show.
     * @param  boolean $inverse  if true, dependant fields will be shown if any other value than $show_values is selected.
     * @return $this
     */
    public function startDependantFields($parent_field, $show_values, $inverse = false)
    {
        $this->addHtml('<div class="hidden-wrapper off" data-parent="' . $parent_field . '" data-show-values="' . $show_values . '" data-inverse="' . $inverse . '">');
        if (!in_array('dependant-fields', $this->js_plugins)) {
            $this->addPlugin('dependant-fields', '.hidden-wrapper');
        }

        return $this;
    }

    /**
     * Ends a dependant field block
     * @return $this
     */
    public function endDependantFields()
    {
        $this->addHtml('</div>');

        return $this;
    }

    /**
     * Allows to group inputs in the same wrapper
     *
     * Arguments can be :
     *     -    a single array with fieldnames to group
     *     OR
     *     -    fieldnames given as string
     *
     * @param string|array $input1 The name of the first input of the group
     *                             OR
     *                             array including all fieldnames
     *
     * @param string $input2 The name of the second input of the group
     * @param string $input3 [optional] The name of the third input of the group
     * @param string $input4 [optional] The name of the fourth input of the group
     * @param string ...etc.
     * @return $this
     */
    public function groupInputs($input1, $input2 = '', $input3 = '', $input4 = '', $input5 = '', $input6 = '', $input7 = '', $input8 = '', $input9 = '', $input10 = '', $input11 = '', $input12 = '')
    {
        $group = array();

        if(is_array($input1)) {

            // if array given
            for ($i=1; $i <= count($input1); $i++) {
                $group['input_' . $i] = $input1[$i-1];
            }
        } else {

            // if strings given
            for ($i=1; $i < 13; $i++) {
                $input = 'input' . $i;
                if(!empty($$input)) {
                    $group['input_' . $i] = $$input;
                }
            }
        }
        $this->input_grouped[] = $group;

        return $this;
    }

    /*=================================
    js-plugins
    =================================*/

    /**
     * Gets and tests plugins url ($this->plugins_url).
     * Adds a javascript plugin to the selected field(s)
     * @param string $plugin_name     The name of the plugin,
     *                                must be the name of the xml file
     *                                in plugins-config dir
     *                                without extension.
     *                                Example : colorpicker
     * @param string $selector        The jQuery style selector.
     *                                Examples : #colorpicker
     *                                .colorpicker
     * @param string $js_content      (Optional) The xml node where your plugin code is
     *                                in plugins-config/[your-plugin.xml] file
     * @param array  $js_replacements (Optional) An associative array containing
     *                                the strings to search as keys
     *                                and replacement values as data.
     *                                Strings will be replaced with data
     *                                in <js_code> xml node of your
     *                                plugins-config/[your-plugin.xml] file.
     * @return $this
     */
    public function addPlugin($plugin_name, $selector, $js_content = 'default', $js_replacements = '')
    {
        if(empty($this->plugins_url)) {
            $this->setPluginsUrl();
        }
        if ($plugin_name == 'icheck' && $this->framework == 'material') {
            $this->buildErrorMsg('ICHECK PLUGIN + MATERIAL<br>iCheck plugin cannot be used with Material plugin.');
        }
        if (!in_array($plugin_name, $this->js_plugins)) {
            $this->js_plugins[] = $plugin_name;
        }
        $this->js_fields[$plugin_name][]       = $selector;
        $this->js_content[$plugin_name][]      = $js_content;
        $this->js_replacements[$plugin_name][] = $js_replacements;

        return $this;
    }

    /**
     * Prints html code to include css or js files needed by plugins.
     *
     * @param string  $type    value : 'css' or 'js'
     * @param boolean $debug   (Optional) True or false.
     *                         If true, the html code will be displayed
     * @param boolean $display (Optional) True or false.
     *                         If false, the html code will be returned but not displayed.
     * @return $this
     */
    public function printIncludes($type, $debug = false, $display = true)
    {
        $this->getIncludes($type);
        $out = '';
        if ($type == 'css') {
            foreach ($this->css_includes as $plugin_name) {
                foreach ($plugin_name as $css_file) {
                    if (!in_array($css_file, Form::$instances['css_files'])) {
                        Form::$instances['css_files'][] = $css_file;
                        if (preg_match('`http(s)?://`', $css_file)) { // if absolute path in XML
                            $out .= '<link href="' . $css_file . '" rel="stylesheet" media="screen">' . "\n";
                        } elseif (strlen($css_file) > 0) { // if relative path in XML
                            $out .= '<link href="' . $this->plugins_url . $css_file . '" rel="stylesheet" media="screen">' . "\n";
                        }
                    }
                }
            }
            $out .= '<style>' . "\n";

            // add inline style to adjust bottom margins with horizontal forms and grouped fields on small screens
            $out .= '/* Small screens */' . "\n";
            $out .= '@media only screen and (max-width : 767px) {' . "\n";
            $out .= '    .form-group > div[class*="col-"]:not(:last-child) {' . "\n";
            $out .= '        margin-bottom: 15px;' . "\n";
            $out .= '    }' . "\n";
            $out .= '}' . "\n";

            // overwrite bootstrap-select z-index for modal
            $out .= '.bootstrap-select.btn-group.bs-container .dropdown-menu {z-index: 10000 !important}' . "\n";
            $out .= '</style>' . "\n";
        } elseif ($type == 'js') {
            foreach ($this->js_includes as $plugin_name) {
                foreach ($plugin_name as $js_file) {
                    if (!in_array($js_file, Form::$instances['js_files'])) {
                        Form::$instances['js_files'][] = $js_file;
                        if (preg_match('`http(s)?://`', $js_file)) { // if absolute path in XML
                            $out .= '<script src="' . $js_file . '"></script>' . "\n";
                        } elseif (strlen($js_file) > 0) { // if relative path in XML
                            $out .= '<script src="' . $this->plugins_url . $js_file . '"></script>' . "\n";
                        }
                    }
                }
            }
        }
        if ($debug == true) {
            echo '<pre class="prettyprint">' . htmlspecialchars($out) . '</pre>';
        }
        if ($display === false) {
            return $out;
        } else {
            echo $out;
        }

        return $this;
    }

    /**
     * Prints js code generated by plugins.
     * @param boolean $debug   (Optional) True or false.
     *                         If true, the html code will be displayed
     * @param boolean $display (Optional) True or false.
     *                         If false, the html code will be returned but not displayed.
     * @return $this
     */
    public function printJsCode($debug = false, $display = true)
    {
        $this->getJsCode();
        if ($debug == true) {
            echo '<pre class="prettyprint">' . htmlspecialchars($this->js_code) . '</pre>';
            echo '<pre class="prettyprint">' . htmlspecialchars($this->fileupload_js_code) . '</pre>';
        }
        if ($display === false) {
            return $this->js_code . $this->fileupload_js_code;
        } else {
            echo $this->js_code;
            echo $this->fileupload_js_code;
        }

        return $this;
    }

    /* =============================================
    popover
    ============================================= */

    /**
     * wrap form in a popover
     * @param string $popover_link the id of the link which triggers popover
     * @param array  $options      (Optional) An associative array containing
     *                             'placement' : auto,top,right,bottom,left,top-right,top-left,bottom-right,bottom-left,auto-top,auto-right,auto-bottom,auto-left,horizontal,vertical
     *                             'width' : 'auto' or number
     *                             'height' : 'auto' or number
     *                             'closeable' : display close button or not
     *                             'animation' : pop with animation,values: null, pop,fade
     *                             'backdrop' : if backdrop is set to true, popover will use backdrop on open
     * @return $this
     */
    public function popover($popover_link, $options = array())
    {
        $default_options = array(
            'placement' => 'bottom',
            'width' =>  'auto',
            'height' =>  'auto',
            'closeable' => true,
            'animation' => 'pop',
            'backdrop' => true
        );
        $replacements = array('%formID%' => $this->form_ID);
        foreach ($default_options as $key => $value) {
            if (!array_key_exists($key, $options)) {
                $options[$key] = $value;
            }
            if (is_numeric($options[$key])) {
                $replacements['%' . $key . '%'] = $options[$key];
            } elseif (is_bool($options[$key])) {
                if ($options[$key] === true) {
                    $replacements['%' . $key . '%'] = "true";
                } else {
                    $replacements['%' . $key . '%'] = "false";
                }
            } else {
                $replacements['%' . $key . '%'] = "'" . $options[$key] . "'";
            }
        }
        $this->addPlugin('popover', $popover_link, 'default', $replacements);
        $this->form_start_wrapper = '<div class="hidden">';
        $this->form_start_wrapper .= '<div id="' . $this->form_ID . '-content">';
        $this->form_end_wrapper = '</div>';
        $this->form_end_wrapper .= '</div>';

        return $this;
    }

    /* =============================================
    modal
    ============================================= */

    /**
     * wrap form in a modal
     * @param string $modal_target href attribute of the link to modal
     * @return $this
     */
    public function modal($modal_target)
    {
        $replacements = array('%formID%' => $this->form_ID);
        $this->addPlugin('modal', $modal_target, 'default', $replacements);
        $this->form_start_wrapper = '<div class="remodal" data-remodal-id="' . str_replace('#', '', $modal_target) . '" id="' . str_replace('#', '', $modal_target) . '">';
        $this->form_start_wrapper .= '<button data-remodal-action="close" class="remodal-close"></button>';
        $this->form_end_wrapper = '</div>';

        return $this;
    }

    /*=================================
    render
    =================================*/

    /**
     * Renders the html code of the form.
     *
     * @param boolean $debug   (Optional) True or false.
     *                         If true, the html code will be displayed
     * @param boolean $display (Optional) True or false.
     *                         If false, the html code will be returned but not displayed.
     * @return $this
     *
     */
    public function render($debug = false, $display = true)
    {
        // wrapper for popover | remodal plugins
        $html = $this->form_start_wrapper;
        if (!empty($this->error_msg)) { // if iCheck used with material
            echo $this->error_msg;
        }
        if (!empty($_SERVER['QUERY_STRING'])) {
            $get = '?' . $_SERVER['QUERY_STRING'];
        }
        if (empty($this->action)) {
            $this->action = htmlspecialchars($_SERVER["PHP_SELF"]);
        }
        if ($this->btn_reset != '') {
            $html .= $this->btn_reset;
        }
        $html .= '<form ';
        if (!empty($this->form_ID)) {
            $html .= 'id="' . $this->form_ID . '" ';
        }
        $html .= 'action="' . $this->action;
        if (isset($get) and $this->add_get_vars === true) {
            $html .= $get;
        }
        $html .= '" method="' . $this->method . '"';
        if ($this->has_file === true) {
            $html .= ' enctype="multipart/form-data"';
        }

        /* layout */

                /* layout */

        $attr = $this->getAttributes($this->form_attr);

        if ($this->layout == 'horizontal' && !empty($this->options['formHorizontalClass'])) {
            $attr = $this->addClass($this->options['formHorizontalClass'], $attr);
        } elseif ($this->layout == 'inline' && !empty($this->options['formInlineClass'])) {
            $attr = $this->addClass($this->options['formInlineClass'], $attr);
        } elseif (!empty($this->options['formVerticalClass'])) {
            $attr = $this->addClass($this->options['formVerticalClass'], $attr);
        }
        $material_class = '';
        if ($this->framework == 'material') {
            $attr = $this->addClass('material-form', $attr);
        }
        if (!empty($attr)) {
            $html .= ' ' . $attr;
        }
        $html .= '>';
        if (!empty($this->hidden_fields)) {
            $html .= '<div>' . $this->hidden_fields . '</div>';
        }
        $html .= $this->html;
        $html .= $this->btn_submit;
        if (!empty($this->btn_cancel)) {
            $html .= $this->btn_cancel;
        }
        if (!empty($this->txt)) {
            $html .= $this->txt;
        }
        if (!empty($this->end_fieldset)) {
            $html .= $this->end_fieldset;
        }
        $html .= '</form>';
        $html .= $this->form_end_wrapper;
        if ($debug == true) {
            echo '<pre class="prettyprint">' . htmlspecialchars($this->cleanHtmlOutput($html)) . '</pre>';
        } elseif ($display === false) {
            return $html;
        } else {
            echo $html;
        }

        return $this;
    }

    /**
     * set html output linebreaks and indent
     * @param  string $html
     * @return string clean html
     */
    public function cleanHtmlOutput($html)
    {
        include_once dirname(__FILE__) . '/FormatHtml.php';
        $cleaning_object = new FormatHtml();

        // set linebreaks & indent
        $html = $cleaning_object->html($html);

        // remove empty lines
        $html = preg_replace("/(^[\r\n]*|[\r\n]+)[\s\t]*[\r\n]+/", "\n", $html);

        return $html;
    }


    /* =============================================
    validation
    ============================================= */

    /**
     * create Validator object and auto-validate all required fields
     * @param  string $form_ID the form ID
     * @return object          the Validator
     */
    public static function validate($form_ID, $lang = 'en')
    {
        include_once 'Validator/Validator.php';
        include_once 'Validator/Exception.php';
        $validator = new Validator($_POST, $lang);
        $required = $_SESSION[$form_ID]['required_fields'];
        foreach ($required as $required) {
            if(isset($_POST[$required]) && is_array($_POST[$required])) {
                $required = $required . '.0';
            }
            $validator->required()->validate($required);
        }

        return $validator;
    }

    /*=================================
    email sending
    =================================*/

    public static function sendMail($options, $smtp_settings = array())
    {
        $default_options = array(
            'sender_email'          => '',
            'sender_name'           => '',
            'reply_to_email'        => '',
            'recipient_email'       => '',
            'cc'                    => '',
            'bcc'                   => '',
            'subject'               => 'Contact',
            'attachments'           => '',
            'template'              => 'default.html',
            'human_readable_labels' => true,
            'values'                => $_POST,
            'filter_values'         => '',
            'custom_replacements'   => array(),
            'sent_message'          => '<p class="alert alert-success">Your message has been successfully sent !</p>',
            'debug'                 => false,
            'smtp'                  => false
        );

        /* replace default options with user's */

        foreach ($default_options as $key => $value) {
            if (isset($options[$key])) {
                $$key = $options[$key];
            } else {
                $$key = $value;
            }
        }
        require_once 'mailer/phpmailer/PHPMailerAutoload.php';
        require_once 'mailer/pelago/Emogrifier.php';
        require_once 'mailer/phpmailer/extras/htmlfilter.php';
        $mail = new \PHPMailer();
        try {

            // if smtp
            if($smtp === true) {
                if($debug === true) {
                    $mail->SMTPDebug = 3;                           // Enable verbose debug output
                }
                $mail->isSMTP();                                    // Set mailer to use SMTP
                $mail->Host       = $smtp_settings['host'];         // Specify main and backup SMTP servers
                $mail->SMTPAuth   = $smtp_settings['smtp_auth'];    // Enable SMTP authentication
                $mail->Username   = $smtp_settings['username'];     // SMTP username
                $mail->Password   = $smtp_settings['password'];     // SMTP password
                $mail->SMTPSecure = $smtp_settings['smtp_secure'];  // Enable TLS encryption, `ssl` also accepted
                $mail->Port       = $smtp_settings['port'];         // TCP port to connect to
            }

            if ($sender_name != '') {
                if ($reply_to_email !== '') {
                    $mail->addReplyTo($reply_to_email);
                } else {
                    $mail->addReplyTo($sender_email, $sender_name);
                }
                $mail->From     = $sender_email;
                $mail->FromName = $sender_name;
            } else {
                if ($reply_to_email !== '') {
                    $mail->addReplyTo($reply_to_email);
                } else {
                    $mail->addReplyTo($sender_email);
                }
                $mail->From     = $sender_email;
                $mail->FromName = $sender_email;
            }
            $indiAdress = explode(',', $recipient_email);
            foreach ($indiAdress as $key => $value) {
                $mail->addAddress(trim($value));
            }
            if ($bcc != '') {
                $indiBCC = explode(',', $bcc);
                foreach ($indiBCC as $key => $value) {
                    $mail->addBCC(trim($value));
                }
            }
            if ($cc != '') {
                $indiCC = explode(',', $cc);
                foreach ($indiCC as $key => $value) {
                    $mail->addCC(trim($value));
                }
            }
            if ($attachments != '') {

                /*
                    =============================================
                    single file :
                    =============================================

                    $attachments = 'path/to/file';

                    =============================================
                    multiple files separated with commas :
                    =============================================

                    $attachments = 'path/to/file_1, path/to/file_2';

                    =============================================
                    single file with file_path + file_name :
                    (specially for posted files)
                    =============================================

                    $attachments =  arrray(
                                        'file_path' => 'path/to/file.jpg', // complete path with filename
                                        'file_name' => 'my-file.jpg'
                                    )

                    =============================================
                    multiple files array containing :
                        sub-arrays with file_path + file_name
                        or file_name strings
                    =============================================

                    $attachments =  arrray(
                                        'path/to/file_1',
                                        'path/to/file_2',
                                        arrray(
                                            'file_path' => 'path/to/file.jpg', // complete path with filename
                                            'file_name' => 'my-file.jpg'
                                        ),
                                        ...
                                    )
                 */

                if (is_array($attachments)) {
                    if (isset($attachments['file_path'])) {
                        $mail->addAttachment($attachments['file_path'], $attachments['file_name']);
                    } else {
                        foreach ($attachments as $key => $value) {
                            if (is_array($value)) {
                                $mail->addAttachment($value["file_path"], $value["file_name"]);
                            } else {
                                $attach = explode(",", $attachments);
                                foreach ($attach as $key => $value) {
                                    $mail->addAttachment(trim($value));
                                }
                            }
                        }
                    }
                } else {
                    $attach = explode(",", $attachments);
                    foreach ($attach as $key => $value) {
                        $mail->addAttachment(trim($value));
                    }
                }
            }
            $filter = explode(',', $filter_values);

            // filter recaptcha
            $filter[] = 'g-recaptcha-response';

            // sanitize filter values
            for ($i = 0; $i < count($filter); $i++) {
                $filter[$i] = trim(mb_strtolower($filter[$i]));
            }
            $mail->Subject = $subject;
        } catch (phpmailerException $e) { //Catch all kinds of bad addressing
            throw new phpmailerAppException($e->getMessage());
        }
        try {

            /* Load html & css templates */

            $html_template_path = str_replace(array('/', '\\'), DIRECTORY_SEPARATOR, pathinfo(__FILE__, PATHINFO_DIRNAME) . '/mailer/email-templates/' . $template);
            $html_template_custom_path = str_replace(array('/', '\\'), DIRECTORY_SEPARATOR, pathinfo(__FILE__, PATHINFO_DIRNAME) . '/mailer/email-templates-custom/' . $template);

            if (file_exists($html_template_custom_path)) {
                $template_error_msg = '';
                $debug_msg = '';

                // try to load html template in email-templates-custom dir
                if (!$html = file_get_contents($html_template_custom_path)) {
                    $template_error_msg = 'Html template file doesn\'t exists';
                    $debug_msg          = $html_template_custom_path;
                }
            } else if (file_exists($html_template_path)) {

                // try to load html template in email-templates dir
                if (!$html = file_get_contents($html_template_path)) {
                    $template_error_msg = 'Html template file doesn\'t exists';
                    $debug_msg          = $html_template_path;
                }
            } else {
                    $template_error_msg = 'Html template file doesn\'t exists';
                    $debug_msg          = $html_template_path;
            }
            $css_template_path        = str_replace('.html', '.css', $html_template_path);
            $css_template_custom_path = str_replace('.html', '.css', $html_template_custom_path);

            if (file_exists($css_template_custom_path) && empty($template_error_msg)) {

                // try to load css template in email-templates-custom dir
                if (!$css = file_get_contents($css_template_custom_path)) {
                    $template_error_msg = 'CSS template file doesn\'t exists';
                    $debug_msg          = $css_template_custom_path;
                }
            } else if (file_exists($css_template_path) && empty($template_error_msg)) {

                // try to load css template in email-templates dir
                if (!$css = file_get_contents($css_template_path)) {
                    $template_error_msg = 'CSS template file doesn\'t exists';
                    $debug_msg          = $css_template_path;
                }
            } else if(empty($template_error_msg)) {
                    $template_error_msg = 'CSS template file doesn\'t exists';
                    $debug_msg          = $css_template_path;
            }

            /* If html|css template not found */

            if(!empty($template_error_msg)) {
                if($debug === true) {
                    $template_error_msg = $debug_msg . '<br>' . $template_error_msg;
                }

                throw new \Exception('<div style="line-height:30px;border-radius:5px;border-bottom:1px solid #ac2925;background-color: #c9302c;margin:10px auto;"><p style="color:#fff;text-align:center;font-size:16px;margin:0">' . $template_error_msg . '</p></div>');
            }

            /* Automatic table including all but filtered values */

            $email_table = '<table class="one-column">';
            $email_table .= '<tbody>';

            // prepare regex for human_readable_labels
            $find = array('`([a-zA-Z0-9])-([a-zA-Z0-9])`', '`([a-zA-Z0-9])_([a-zA-Z0-9])`');
            $replace = array('$1 $2', '$1 $2');
            foreach ($values as $key => $value) {
                if (!in_array(mb_strtolower($key), $filter)) {

                    // replace key (label) with human_readable_label
                    if($human_readable_labels === true) {
                        $key = preg_replace($find, $replace, $key);
                    }
                    if (!is_array($value)) {
                            $email_table .= '<tr>';

                            // replace with custom if key exists
                                if(is_array($custom_replacements) && in_array($key, array_keys($custom_replacements))) {
                                    $email_table .= '<th class="inner">' . ucfirst($custom_replacements[$key]) . ': ' . '</th>';
                                } else {
                                    $email_table .= '<th class="inner">' . ucfirst($key) . ': ' . '</th>';
                                }
                            $email_table .= '<td class="inner">' . nl2br($value) . '</td>';
                            $email_table .= '</tr>';
                    } else {
                        foreach ($value as $key_array => $value_array) {
                            $email_table .= '<tr>';
                            $email_table .= '<th class="inner">' . ucfirst($key) . ' ' . ($key_array + 1) . ': ' . '</th>';
                            $email_table .= '<td class="inner">' . $value_array . '</td>';
                            $email_table .= '</tr>';
                        }
                    }
                }
            }
            $email_table .= '</tbody>';
            $email_table .= '</table>';

            $html = str_replace('{table}', $email_table, $html);
            $html = str_replace('{subject}', $subject, $html);


            /* replacements in html */

            // first, replace posted values in html
            foreach ($values as $key => $value) {
                if (!in_array(mb_strtolower($key), $filter) && !is_array($value)) {
                    $html = str_replace('{' . $key . '}', $value, $html);
                }
            }

            // then replace custom replacements in html
            foreach ($custom_replacements as $key => $value) {
                if (!in_array(mb_strtolower($key), $filter) && !is_array($value)) {
                    $html = str_replace('{' . $key . '}', $value, $html);
                }
            }
            // preg_replace('`{(.*)+}`', 'false', $html);

            /* custom replacements in css */

            foreach ($custom_replacements as $key => $value) {
                if (!in_array(mb_strtolower($key), $filter) && !is_array($value)) {
                    $css = str_replace('{' . $key . '}', $value, $css);
                }
            }

            $emogrifier = new \Pelago\Emogrifier();
            $emogrifier->addExcludedSelector('br');
            $emogrifier->enableCssToHtmlMapping();
            $emogrifier->setHtml($html);
            $emogrifier->setCss($css);
            $mergedHtml = $emogrifier->emogrify();
            HTMLFilter($mergedHtml, '', false);
        } catch (\Exception $e) { //Catch all content errors

            return $e->getMessage();
        }
        $mail->msgHTML($mergedHtml, dirname(__FILE__), true);
        $charset = mb_detect_encoding($mergedHtml);
        $mail->CharSet = $charset;
        if (!$mail->send()) {
            if ($debug === true) {
                return '<p class="alert alert-danger">Mailer Error: ' . $mail->ErrorInfo . '</p>';
            }
        } else {
            return $sent_message;
        }
    }

    /**
     * stores the ID of the form to be cleared.
     * when next instance is created it will not store posted values in session
     * unsets all sessions vars attached to the form
     * @param string $form_ID
     */
    public static function clear($form_ID)
    {
        $_SESSION['clear_form'][$form_ID] = true;
        if (isset($_SESSION[$form_ID]['fields'])) {
            foreach ($_SESSION[$form_ID]['fields'] as $key => $name) {
                unset($_SESSION[$form_ID]['fields'][$key]);
                unset($_SESSION[$form_ID][$name]);
            }
        }
    }

    /*=================================
    protected & static functions
    =================================*/

    /**
     * output element html code including wrapper, label, element with group, icons, ...
     * @param  string $start_wrapper
     * @param  string $end_wrapper
     * @param  string $start_label
     * @param  string $end_label
     * @param  string $input
     * @return string element html code
     */
    protected function outputElement($start_wrapper, $end_wrapper, $start_label, $end_label, $start_col, $end_col, $element_html)
    {
        $html = $start_wrapper;
        if (!empty($start_label) && $this->options['wrapElementsIntoLabels'] === true) {
            $html .= $start_label . $start_col . $element_html . $end_col . $end_label;
        } else {
            $label_col = 0;
            if (preg_match('`([0-9]+)`', $this->options['horizontalLabelCol'], $out)) {
                $label_col = $out[1];
            }
            if ($this->framework === 'material') {
                if ($label_col < 1) {

                    // label after element if label is into col div
                    $html .= $start_col . $element_html . $start_label . $end_label . $end_col;
                } else {

                    // label before element
                    $html .= $start_label . $end_label . $start_col . $element_html . $end_col;
                }
            } else {

                // label before element
                $html .= $start_label . $end_label . $start_col . $element_html . $end_col;
            }
        }
        $html .= $end_wrapper;

        return $html;
    }

    /**
     * wrap element itself with error div if input is grouped or if $label is empty
     * @param  string $name
     * @param  string $label
     * @param  string $pos   'start' | 'end'
     * @return string div start | end
     */
    protected function getErrorInputWrapper($name, $label, $pos)
    {
        $isGrouped = $this->isGrouped($name);
        if ($isGrouped == true || $label == '') {
            if (in_array($name, array_keys($this->error_fields))) {
                if ($pos == 'start') {
                    return '<div class="' . $this->options['wrapperErrorClass'] . '">';
                } else {
                    return '</div>';
                }
            }
        }
    }

    /**
     * check if name belongs to a group input
     * @param  string  $name
     * @return boolean
     */
    protected function isGrouped($name)
    {
        foreach ($this->input_grouped as $input_grouped) {
            if (in_array($name, $this->input_grouped)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Allows to group inputs in the same wrapper (12 inputs max.)
     * @param string $name        The input name
     * @param string $wrapper_pos start | end
     */
    protected function setInputGroup($name, $wrapper_pos)
    {
        if (!empty($this->options['elementsWrapper'])) {
            $grouped = false;
            $input_pos = ''; // start | middle | end
            $pattern_2_wrappers = '`<([^>]+)><([^>]+)></([^>]+)></([^>]+)>`';
            if ($wrapper_pos == 'start') {
                foreach ($this->input_grouped as $input_grouped) {
                    for ($i=1; $i < 12; $i++) {
                        $input = 'input_' . ($i + 1);
                        $next_input = 'input_' . ($i + 2);
                        if (isset($input_grouped[$input]) && $name == $input_grouped[$input]) {
                            $grouped = true;
                            if(isset($input_grouped[$next_input])) {
                                $input_pos = 'middle';
                            } else {
                                $input_pos = 'end';
                            }
                        }
                    }
                }
                if ($grouped == true && $input_pos == 'middle' || $input_pos == 'end') {
                    if (preg_match($pattern_2_wrappers, $this->options['elementsWrapper'], $out)) {
                        return '<' . $out[2] . '>';
                    } else {
                        return '';
                    }
                } else {
                    return $this->elements_start_wrapper;
                }
            } elseif ($wrapper_pos == 'end') {
                foreach ($this->input_grouped as $input_grouped) {
                    for ($i=0; $i < 12; $i++) {
                        $input = 'input_' . ($i + 1);
                        $next_input = 'input_' . ($i + 2);
                        if ($i == 0 && $name == $input_grouped[$input]) {
                            $grouped = true;
                            $input_pos = 'start';
                        } elseif (isset($input_grouped[$input]) && $name == $input_grouped[$input] && isset($input_grouped[$next_input])) {
                            $input_pos = 'middle';
                        }
                    }
                }
                if ($grouped === true && $input_pos == 'start' || $input_pos == 'middle') {
                    if (preg_match($pattern_2_wrappers, $this->options['elementsWrapper'], $out)) {
                        return '</' . $out[3] . '>';
                    } else {
                        return '';
                    }
                } else {
                    return $this->elements_end_wrapper;
                }
            }
        } else {
            return '';
        }
    }

    /**
    * When the form is posted, values are passed in session
    * to be keeped and displayed again if posted values aren't correct.
    */
    protected function registerField($name, $attr)
    {
        $form_ID = $this->form_ID;
        if (!isset($_SESSION[$form_ID])) {
            $_SESSION[$form_ID]           = array();
        }
        if (!isset($_SESSION[$form_ID]['fields'])) {
            $_SESSION[$form_ID]['fields'] = array();
        }
        if (!isset($_SESSION[$form_ID]['required_fields'])) {
            $_SESSION[$form_ID]['required_fields'] = array();
        }
        $name = preg_replace('`(.*)\[\]`', '$1', $name); // if $name is an array, we register without hooks ([])
        if (!in_array($name, $_SESSION[$form_ID]['fields'])) {
            $_SESSION[$form_ID]['fields'][] = $name;
        }

        // register required fields
        if (preg_match('`required`', $attr) && !in_array($name, $_SESSION[$form_ID]['required_fields'])) {
            $_SESSION[$form_ID]['required_fields'][] = $name;
        }
    }

    /**
     * register posted values in session
     * @param string $form_ID
     */
    public static function registerValues($form_ID)
    {
        if (!isset($_SESSION[$form_ID])) {
            $_SESSION[$form_ID]           = array();
            $_SESSION[$form_ID]['fields'] = array();
        }
        foreach ($_SESSION[$form_ID]['fields'] as $index => $name) {
            if (isset($_POST[$name])) {
                $value = $_POST[$name];
                if (!is_array($value)) {
                    $_SESSION[$form_ID][$name] = trim($value);
                    // echo $name . ' => ' . $value . '<br>';
                } else {
                    $_SESSION[$form_ID][$name] = array();
                    foreach ($value as $array_key => $array_value) {
                        $_SESSION[$form_ID][$name][$array_key] = trim($array_value);
                        // echo $name . ' ' . $array_key . ' ' . $array_value . '<br>';
                    }
                }
            } else { // if checkbox unchecked, it hasn't been posted => we store empty value
                $_SESSION[$form_ID][$name] = '';
            }
        }
    }

    /**
     * merge previously registered session vars => values of each registered form
     * @param  array $forms_array array of forms IDs to merge
     * @return array pairs of names => values
     *                           ex : $values[$field_name] = $value
     */
    public static function mergeValues($form_names_array)
    {
        $values = array();
        foreach ($form_names_array as $form_name) {
            $fields = $_SESSION[$form_name]['fields'];
            foreach ($fields as $key => $field_name) {
                if (isset($_SESSION[$form_name][$field_name])) {
                    $values[$field_name] = $_SESSION[$form_name][$field_name];
                }
            }
        }

        return $values;
    }

    /**
     * generate token to protect against CSRF
     * @return string $token
     */
    protected function generateToken()
    {
        $token = uniqid(rand(), true);
        $token_name = $this->form_ID;
        $_SESSION[$token_name . '_token'] = $token;
        $_SESSION[$token_name . '_token_time'] = time();

        return $token;
    }

    /**
     * validate token to protect against CSRF
     */
    public static function testToken($form_ID)
    {
        if (isset($_SESSION[$form_ID . '_token']) && isset($_SESSION[$form_ID . '_token_time']) && isset($_POST['token'])) {
            if ($_SESSION[$form_ID.'_token'] == $_POST['token']) {

                // validity for token = 1800 sec. = 30mn.
                if ($_SESSION[$form_ID.'_token_time'] >= (time() - 1800)) {
                    return true;
                }
            }
        } else {
            return false;
        }
    }

    /**
    * Gets errors stored in session
    */
    protected function registerErrors()
    {
        $form_ID = $this->form_ID;
        foreach ($_SESSION['errors'][$form_ID] as $field => $message) {

            /* replace dot syntax with array (field.index => field[] */

            $field = preg_replace('`\.(.*)+`', '[]', $field);
            $this->error_fields[$field] = $message;
        }

        // register recaptcha error
        if(isset($_SESSION['errors'][$form_ID])) {
            $error_keys = array_keys($_SESSION['errors'][$form_ID]);
            if(in_array('g-recaptcha-response', $error_keys)) {
                $this->has_recaptcha_error  = true;
                $this->recaptcha_error_text = $_SESSION['errors'][$form_ID]['g-recaptcha-response'];
            }
        }
    }

    /**
    * Gets html code to start | end elements wrappers
    *
    * @param string $html The html wrapper code
    * @param string $pos 'start' or 'end'
    * @return string Starting or ending html tag
    */
    protected function defineWrapper($html, $pos)
    {
        /* if 2 wrappers */

        $pattern_2_wrappers = '`<([^>]+)><([^>]+)></([^>]+)></([^>]+)>`';
        if (preg_match($pattern_2_wrappers, $html, $out)) {
            if ($pos == 'start') {
                return '<' . $out[1] . '>' . '<' . $out[2] . '>';
            } else {
                return '</' . $out[3] . '>' . '</' . $out[4] . '>';
            }
        }

        /* if only 1 wrapper */

        $pattern_1_wrapper = '`<([^>]+)></([^>]+)>`';
        if (preg_match($pattern_1_wrapper, $html, $out)) {
            if ($pos == 'start') {
                return '<' . $out[1] . '>';
            } else {
                return '</' . $out[2] . '>';
            }
        }
    }

    /**
    * Adds warnings class to elements wrappers
    *
    * @param string $start_wrapper The html wrapper code
    * @param string $name The element name
    * @return string Wrapper Html tag with or without error class
    */
    protected function addErrorWrapper($name, $pos)
    {
        $error_wrapper = '';
        if (in_array($name, array_keys($this->error_fields)) && !empty($this->options['wrapperErrorClass'])) {
            if ($pos == 'start') {
                $error_wrapper = '<div class="' . $this->options['wrapperErrorClass'] . '">';
            } else {
                $error_wrapper = '</div>';
            }
        }

        return $error_wrapper;
    }

    /**
    * Gets element value
    *
    * Returns default value if not empty
    * Else returns session value if it exists
    * Else returns an emplty string
    *
    * @param string $name The element name
    * @param string $value The default value
    * @return string The element value
    */
    protected function getValue($name, $value)
    {
        $form_ID = $this->form_ID;
        if (!empty($value) || is_numeric($value)) {
            return htmlspecialchars($value);
        } elseif (isset($_SESSION[$form_ID][$name])) {
            return htmlspecialchars($_SESSION[$form_ID][$name]);
        } elseif (preg_match('`([^\\[]+)\[([^\\]]+)\]`', $name, $out)) { // arrays
            $array_name = $out[1];
            $array_key = $out[2];
            if (isset($_SESSION[$form_ID][$array_name][$array_key])) {
                return htmlspecialchars($_SESSION[$form_ID][$array_name][$array_key]);
            } else {
                return htmlspecialchars($_SESSION[$form_ID][$name]);
            }
        } else {
            return '';
        }
    }

    /**
    * Adds warnings if the form was posted with errors
    *
    * Warnings are stored in session, and will be displayed
    * even if your form was called back with header function.
    *
    * @param string $name The element name
    * @return string The html error
    */
    protected function getError($name)
    {
        if (in_array($name, array_keys($this->error_fields))) {
            return '<p class="' . $this->options['textErrorClass'] . '">' . $this->error_fields[$name] . '</p>';
        }
    }

    /**
    * Automaticaly adds requiredMark (see options) to labels's required fields
    * @param string $label The element label
    * @param string $attr The element attributes
    * @return string The element label if required html markup if needed
    */
    protected function getRequired($label, $attr)
    {
        if (preg_match('`required`', $attr)) {
            preg_match('`([^:]+)(: )*(.*)`', $label, $out);

            return $out[1] . $this->options['requiredMark'] . $out[2] . $out[3];

        } else {
            return $label;
        }
    }

    /**
    * Returns linearised attributes.
    * @param string $attr The element attributes
    * @return string Linearised attributes
    *                Exemple : size=30, required=required => size="30" required="required"
    */
    protected function getAttributes($attr)
    {
        if (empty($attr)) {
            return '';
        } else {
            $clean_attr = '';

            // replace protected commas with expression
            $attr = str_replace('\\,', '[comma]', $attr);

            // replace protected equals with expression
            $attr = str_replace('\\=', '[equal]', $attr);

            // split with commas
            $attr = preg_split('`,`', $attr);
            foreach ($attr as $a) {

                // add quotes
                if (preg_match('`=`', $a)) {
                    $a = preg_replace('`\s*=\s*`', '="', trim($a)) .  '" ';
                } else {

                    // no quote for single attributes
                    $a = trim($a) . ' ';
                }
                $clean_attr .= $a;
            }

            // get back protected commas, equals and trim
            $clean_attr = trim(str_replace(array('[comma]', '[equal]'), array(',', '='), $clean_attr));

            return $clean_attr;
        }
    }

    /**
     * used for chexkboxes | select options only.
     * adds or remove 'checked' or 'selected' according to default / session values.
     * @param  string $field_name
     * @param  string $value
     * @param  string $attr       ex : checked="checked", class="my-class"
     * @param  string $field_type select | checkbox
     * @return string $attr
     */
    protected function getCheckedOrSelected($field_name, $value, $attr, $field_type)
    {
        $form_ID = $this->form_ID;
        $name_without_hook = preg_replace('`(.*)\[\]`', '$1', $field_name);
        if ($field_type == 'select') {
            $attr_selected = 'selected';
        } else {
            $attr_selected = 'checked';
        }
        if (isset($_SESSION[$form_ID][$name_without_hook])) {
            if (!is_array($_SESSION[$form_ID][$name_without_hook])) {
                if ($_SESSION[$form_ID][$name_without_hook] == $value) {
                    if (!preg_match('`' . $attr_selected . '`', $attr)) {
                        $attr = $this->addAttribute($attr_selected, $attr);
                    }
                } else { // we remove 'selected' from $checkbox_attr as user has previously selected another, memorized in session.
                    $attr = $this->removeAttr($attr_selected, $attr);
                }
            } else {
                if (in_array($value, $_SESSION[$form_ID][$name_without_hook])) {
                    if (!preg_match('`' . $attr_selected . '`', $attr)) {
                        $attr = $this->addAttribute($attr_selected, $attr);
                    }
                } else { // we remove 'selected' from $attr as user has previously selected another, memorized in session.
                    $attr = $this->removeAttr('selected', $attr);
                }
            }
        }

        return $attr;
    }

    /**
     * used to add 'checked="checked"' | 'selected="selected"' to select options or checkboxes
     * @param  string $attr_to_add
     * @param  string $attr_string
     * @return string attributes with the added one
     */
    protected function addAttribute($attr_to_add, $attr_string)
    {
        if (empty($attr_string)) {
            $attr_string = ' ' . $attr_to_add . '="' . $attr_to_add . '"';
        } else {
            $attr_string = ' ' . $attr_to_add . '="' . $attr_to_add . '" ' . $attr_string;
        }

        return $attr_string;
    }

    /**
     * removes specific attribute from list (ex : removes 'checked="checked"' from radio in other than default has been stored in session)
     * @param  string $attr_to_remove ex : checked
     * @param  string $attr_string    ex : checked="checked", required
     * @return string attributes without the removed one
     */
    protected function removeAttr($attr_to_remove, $attr_string)
    {
        if (preg_match('`,(\s)?' . $attr_to_remove . '((\s)?=(\s)?([\'|"])?' . $attr_to_remove . '([\'|"])?)?`', $attr_string)) { // beginning comma
            $attr_string = preg_replace('`,(\s)?' . $attr_to_remove . '((\s)?=(\s)?([\'|"])?' . $attr_to_remove . '([\'|"])?)?`', '', $attr_string);
        } elseif (preg_match('`' . $attr_to_remove . '((\s)?=(\s)?([\'|"])?' . $attr_to_remove . '([\'|"])?(\s)?)?,`', $attr_string)) { // ending comma
            $attr_string = preg_replace('`' . $attr_to_remove . '((\s)?=(\s)?([\'|"])?' . $attr_to_remove . '([\'|"])?(\s)?)?,`', '', $attr_string);
        } elseif (preg_match('`' . $attr_to_remove . '((\s)?=(\s)?([\'|"])?' . $attr_to_remove . '([\'|"])?(\s)?)?`', $attr_string)) { // no comma
            $attr_string = preg_replace('`' . $attr_to_remove . '((\s)?=(\s)?([\'|"])?' . $attr_to_remove . '([\'|"])?(\s)?)?`', '', $attr_string);
        }

        return $attr_string;
    }

    /**
    * Gets element ID.
    *
    * @param string $name The element name
    * @param string $attr The element attributes
    * @return string returns ID present in $attr if any,
    *                else returns field's name
    */
    protected function getID($name, $attr)
    {
        if (empty($attr)) {  //
            $array_values['id'] = preg_replace('`\[\]`', '', $name); // if $name is an array, we delete '[]'
            $array_values['attributs'] = '';
        } else {
            if (preg_match('` id="([a-zA-Z0-9_-]+)"`', $attr, $out)) {
                $array_values['id'] = $out[1];
                $array_values['attributs'] = preg_replace('` id="([a-zA-Z0-9_-]+)"`', '', $attr);
            } else {
                $array_values['id'] = preg_replace('`\[\]`', '', $name);
                $array_values['attributs'] = $attr;
            }
        }

        return $array_values;
    }

    /**
    * Add warnings class to elements wrappers
    *
    * @param string $name The element name
    * @return string The element start_wrapper html code with or without error class
    */
    protected function addElementErrorClass($name)
    {
        if (in_array($name, array_keys($this->error_fields))) {
            if (preg_match('`class="`', $start_wrapper)) {
                $start_wrapper = preg_replace('`class="`', 'class="' . $this->options['wrapperErrorClass'] . ' ', $start_wrapper);
            } else {
                $start_wrapper = preg_replace('`>`', ' class="' . $this->options['wrapperErrorClass'] . '">', $start_wrapper);
            }
        }

        return $start_wrapper;
    }

    /**
    * Remove elements wrapper's col class (col-[xs|sm|md|lg]-[0-9]{1,2})
    * Then Add $col_class to elements wrapper
    *
    * @param string $col_class The class name to add
    * @return string The element start_wrapper html code with or without error class
    */

/*    protected function setWrapperColClass($col_class = '')
    {
        $elementsWrapper = $this->options['elementsWrapper'];

        // if $elementsWrapper has a class attribute
        if (preg_match('`class="`', $elementsWrapper)) {

            // replace 'col-(xs|sm|md|lg)-[0-9]{1,2}' with $col_class
            if (!empty($col_class)) {
                $col_class = ' ' . $col_class;
            }
            if (preg_match('`class="(.*)?(col-(xs|sm|md|lg)-[0-9]{1,2})`', $elementsWrapper, $out)) {
                $elementsWrapper = preg_replace('`class="(.*)?(col-(xs|sm|md|lg)-[0-9]{1,2})`', 'class="' . trim($out[1]) . $col_class, $elementsWrapper);
            }
        } else {

            // add $col_class
            $elementsWrapper = preg_replace('`>`', ' class="' . $col_class . '">', $elementsWrapper);
        }

        return $elementsWrapper;
    }*/

    /**
    * Add new class to $attr.(see options).
    *
    * @param string $newclassname The new class
    * @param string $attr The element attributes
    * @return string $attr including new class.
    */
    protected function addClass($newclassname, $attr)
    {

        /* if $attr already contains a class we keep it and add newclassname */

        if (preg_match('`class="([^"]+)"`', $attr, $out)) {
            $new_class =  'class="' . $out[1] . ' ' . $newclassname . '"';

            return preg_replace('`class="([^"]+)"`', $new_class, $attr);
        } else { /* if $attr contains no class we add elementClass */

            return $attr . ' class="' . $newclassname . '"';
        }
    }

    /**
    * Add default element class to $attr.(see options).
    *
    * @param string $name The element name
    * @param string $attr The element attributes
    * @return string The element class with the one defined in options added.
    */
    protected function addElementClass($name, $attr)
    {

        /* we retrieve error if any */

        $error_class = '';
        if (in_array($name, array_keys($this->error_fields)) && !empty($this->options['elementsErrorClass'])) {
            $error_class = ' ' . $this->options['elementsErrorClass'];
        }

        /* if $attr already contains a class we keep it and add elementClass */

        if (preg_match('`class="([^"]+)"`', $attr, $out)) {
            $new_class =  'class="' . $out[1] . ' ' . $this->options['elementsClass'] . $error_class . '"';

            return preg_replace('`class="([^"]+)"`', $new_class, $attr);
        } else { /* if $attr contains no class we add elementClass */
            if (empty($this->options['elementsClass'])) {
                if (empty($error_class)) {
                    return false;
                } else {
                    return ' class="' . $error_class . '"';
                }
            } else {
                return $attr . ' class="' . $this->options['elementsClass'] . $error_class . '"';
            }
        }
    }

    /**
    * Gets label class. (see options).
    *
    * @param string $element (Optional) 'standardElement', 'radio' or 'checkbox'
    * @param string $inline True or false
    * @return string The element class defined in form options.
    */
    protected function getLabelClass($element = 'standardElement', $inline = '')
    {
        if ($element == 'standardElement' || $element == 'fileinput') { // input, textarea, select
            if ($this->layout == 'horizontal') {
                $class = $this->options['horizontalLabelCol'] . ' ' . $this->options['horizontalLabelClass'];
                if ($element == 'fileinput') {
                    $class .= ' fileinput-label';
                }
                $class = trim($class);
                if (!empty($class)) {
                    return ' class="' . $class . '"';
                } else {
                    return '';
                }
            }
        } elseif ($element == 'radio') {
            if ($inline === true) {
                return ' class="' . $this->options['inlineRadioLabelClass'] . '"';
            }
        } elseif ($element == 'checkbox') {
            if ($inline === true) {
                return ' class="' . $this->options['inlineCheckboxLabelClass'] . '"';
            }
        }
    }

    /**
    * Wrapps element with bootstrap's col if needed (see options).
    *
    * @param string $pos 'start' or 'end'
    * @param string $label The element label
    * @return string The html code of the element wrapper.
    */
    protected function getElementCol($pos, $label = '')
    {
        if ($this->layout == 'horizontal' && !empty($this->options['horizontalElementCol'])) {
            if ($pos == 'start') {
                if (empty($label)) {
                    return '<div class="' . $this->options['horizontalOffsetCol'] . ' ' . $this->options['horizontalElementCol'] . '">';
                } else {
                    return '<div class="' . $this->options['horizontalElementCol'] . '">';
                }
            } else { // end

                return '</div>';
            }
        } else {
            return '';
        }
    }

    /**
     * Gets html code to insert just berore or after the element
     *
     * @param  string $name                    The element name
     * @param  string $pos                     'start' or 'end'
     * @param  string $pos_relative_to_wrapper 'inside_wrapper' or 'outside_wrapper' (input groups are inside wrapper, help blocks are outside). Only for inputs.
     * @return string $return                  The html code to insert just before or after the element, inside or outside element wrapper
     *
     */
    protected function getHtmlElementContent($name, $pos, $pos_relative_to_wrapper = '')
    {
        $return = '';
        if (isset($this->html_element_content[$name][$pos])) {
            for ($i=0; $i < count($this->html_element_content[$name][$pos]); $i++) {
                $html = $this->html_element_content[$name][$pos][$i];
                if (empty($pos_relative_to_wrapper)) {
                    $return .= $html;
                } else {
                    if ($pos_relative_to_wrapper == 'outside_wrapper' && !preg_match('`' . $this->options['inputGroupAddonClass'] . '`', $html)) {
                        $return .= $html;
                    } elseif ($pos_relative_to_wrapper == 'inside_wrapper' && preg_match('`' . $this->options['inputGroupAddonClass'] . '`', $html)) {
                        $return .= $html;
                    }
                }
            }

            return $return;
        } else {
            return '';
        }
    }

    /**
    * Gets css or js files needed for js plugins
    *
    * @param string $type 'css' or 'js'
    * @return html code to include needed files
    */
    protected function getIncludes($type)
    {
        foreach ($this->js_plugins as $plugin_name) {
            for ($i=0; $i < count($this->js_content[$plugin_name]); $i++) {
                $js_content      = $this->js_content[$plugin_name][$i]; // default, custom, ...
                $js_replacements = $this->js_replacements[$plugin_name][$i];
                if(file_exists(dirname(__FILE__) . '/plugins-config-custom/' . $plugin_name . '.xml')) {

                    // if custom config xml file
                    $xml = simplexml_load_file(dirname(__FILE__) . '/plugins-config-custom/' . $plugin_name . '.xml');

                    // if node doesn't exist, fallback to default xml
                    if(!isset($xml->{$js_content})) {
                        $xml = simplexml_load_file(dirname(__FILE__) . '/plugins-config/' . $plugin_name . '.xml');
                    }
                } else {
                    $xml = simplexml_load_file(dirname(__FILE__) . '/plugins-config/' . $plugin_name . '.xml');
                }

                /* if custom include path doesn't exist, we keep default path */

                $path = '/root/' . $js_content . '/includes/' . $type . '/file';
                if ($xml->xpath($path) == false) {
                    $path = '/root/default/includes/' . $type . '/file';
                }
                $files = $xml->xpath($path);
                if (!isset($this->css_includes[$plugin_name])) {
                    $this->css_includes[$plugin_name] = array();
                }
                if (!isset($this->js_includes[$plugin_name])) {
                    $this->js_includes[$plugin_name] = array();
                }
                foreach ($files as $file) {
                    if (is_array($js_replacements)) {
                        foreach ($js_replacements as $key => $value) {
                            $file = preg_replace('`' . $key . '`', $value, $file);
                        }
                    }
                    if ($type == 'css' && !in_array($file, $this->css_includes[$plugin_name])) {
                        $this->css_includes[$plugin_name][] = (string) $file;
                    } elseif ($type == 'js' && !in_array($file, $this->js_includes[$plugin_name])) {
                        $this->js_includes[$plugin_name][] = (string) $file;
                    }
                }
            }
        }
    }

    /**
     * Gets js code generated by js plugins
     * Scroll to user error if any
     */
    protected function getJsCode()
    {
        $nbre_plugins = count($this->js_plugins);
        $recaptcha_js = '';
        $this->js_code = '<script type="text/javascript">' . "\n";
        $this->js_code .= $this->options['openDomReady'] . "\n";
        for ($i=0; $i < $nbre_plugins; $i++) {
            $plugin_name = $this->js_plugins[$i]; // ex : colorpicker
            $nbre = count($this->js_fields[$plugin_name]);
            for ($j=0; $j < $nbre; $j++) {
                $selector = $this->js_fields[$plugin_name][$j];
                $js_replacements = $this->js_replacements[$plugin_name][$j];
                $js_content    = $this->js_content[$plugin_name][$j];
                if(file_exists(dirname(__FILE__) . '/plugins-config-custom/' . $plugin_name . '.xml')) {

                    // if custom config xml file
                    $xml = simplexml_load_file(dirname(__FILE__) . '/plugins-config-custom/' . $plugin_name . '.xml');

                    // if node doesn't exist, fallback to default xml
                    if(!isset($xml->{$js_content})) {
                        $xml = simplexml_load_file(dirname(__FILE__) . '/plugins-config/' . $plugin_name . '.xml');
                    }
                } else {
                    $xml = simplexml_load_file(dirname(__FILE__) . '/plugins-config/' . $plugin_name . '.xml');
                }
                if ($plugin_name == 'fileupload') { // fileupload
                    $this->fileupload_js_code .= preg_replace('`%selector%`', $selector, $xml->$js_content->js_code);
                } else if($plugin_name == 'recaptcha') {
                    $recaptcha_js .= preg_replace('`%selector%`', $selector, $xml->$js_content->js_code);
                } else { // others
                    $this->js_code .= preg_replace('`%selector%`', $selector, $xml->$js_content->js_code);
                }
                if (is_array($js_replacements)) {
                    foreach ($js_replacements as $key => $value) {
                        if ($plugin_name == 'fileupload') { // fileupload
                            $this->fileupload_js_code = preg_replace('`' . $key . '`', $value, $this->fileupload_js_code);
                        } else if($plugin_name == 'recaptcha') {
                            $recaptcha_js .= preg_replace('`' . $key . '`', $value, $recaptcha_js);
                        } else { // others
                            $this->js_code = preg_replace('`' . $key . '`', $value, $this->js_code);
                        }
                    }
                }
            }
        }

        // scroll to user error
        if (!empty($this->options['wrapperErrorClass']) && !in_array('modal', $this->js_plugins) && !in_array('popover', $this->js_plugins)) {
            $this->js_code .= "\n" . '    if ($(".' . $this->options['wrapperErrorClass'] . '")[0]) {' . "\n";
            $this->js_code .= '        $("html, body").animate({' . "\n";
            $this->js_code .= '            scrollTop: $($(".' . $this->options['wrapperErrorClass'] . '")[0]).offset().top - 400' . "\n";
            $this->js_code .= '        }, 800);' . "\n";
            $this->js_code .= '    }' . "\n";
        }
        $this->js_code .= $this->options['closeDomReady'] . "\n";

        // recaptcha callback has to be outside domready
        $this->js_code .= $recaptcha_js;
        $this->js_code .= '</script>' . "\n";
    }

    /**
     * get plugins folder url from Form.php path + DOCUMENT_ROOT path
     * $this->plugins_url is a 'Root url' (url without protocol).
     * i.e. : //project/phpformbuilder/plugins/
     */
    protected function setPluginsUrl()
    {
        if(empty($this->plugins_url)) {
            $form_class_path = dirname(__FILE__);
            $this->plugins_path = $form_class_path . DIRECTORY_SEPARATOR . 'plugins' . DIRECTORY_SEPARATOR;

            // reliable document_root (https://gist.github.com/jpsirois/424055)
            $root_path = str_replace($_SERVER['SCRIPT_NAME'],'',$_SERVER['SCRIPT_FILENAME']);

            // reliable document_root with symlinks resolved
            $info = new \SplFileInfo($root_path);
            $real_root_path = $info->getRealPath();

            // sanitize directory separator
            $form_class_path = str_replace(array('/', '\\'), DIRECTORY_SEPARATOR, $form_class_path);
            $real_root_path = str_replace(array('/', '\\'), DIRECTORY_SEPARATOR, $real_root_path);

            $this->plugins_url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . '/' . str_replace(array($real_root_path, DIRECTORY_SEPARATOR), array('', '/'), $this->plugins_path);
        }
    }

    /**
     * display error message if
     *     - iCheck used with material
     * @param string $msg
     */
    protected function buildErrorMsg($msg)
    {
        $this->error_msg = '<div style="line-height:30px;border-radius:5px;border-bottom:1px solid #ac2925;background-color: #c9302c;margin:10px auto;"><p style="color:#fff;text-align:center;font-size:16px;margin:0">' . $msg . '</p></div>';
    }
}
